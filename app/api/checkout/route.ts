import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { TierLevel } from "@prisma/client";

const TIER_PRICING: Record<string, { amount: number; name: string; tier: TierLevel }> = {
  tier_believer: { amount: 200, name: "Day 1 Believer", tier: TierLevel.BELIEVER_2 },
  tier_sprint: { amount: 1900, name: "The Sprint Backer", tier: TierLevel.SPRINT_19 },
  tier_stack: { amount: 4900, name: "The Sovereign Stack", tier: TierLevel.STACK_49 },
  tier_founder: { amount: 9900, name: "The Indie Founder Bundle", tier: TierLevel.FOUNDER_99 },
  tier_patron: { amount: 25000, name: "Founding Patron", tier: TierLevel.PATRON_250 },
};

export async function POST(req: Request) {
  try {
    const { tierId, name, handle, message, email } = await req.json();

    const selectedTier = TIER_PRICING[tierId];
    if (!selectedTier) {
      return NextResponse.json({ error: "Invalid tier selected" }, { status: 400 });
    }

    // 1. Pre-register the backer in pending status
    const backer = await prisma.backer.create({
      data: {
        email: email || "pending@checkout.com",
        name: name || "Anonymous Indie Backer",
        handle: handle || null,
        message: message ? message.slice(0, 120) : null,
        amountUsd: Math.round(selectedTier.amount / 100),
        tier: selectedTier.tier,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 2. Spawn Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Protocol100: ${selectedTier.name}`,
              description: `Backing the 100-day public sprint experiment.`,
            },
            unit_amount: selectedTier.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email || undefined,
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#tiers`,
      metadata: {
        backerId: backer.id,
        tierLevel: selectedTier.tier,
      },
    });

    // 3. Link session ID
    await prisma.backer.update({
      where: { id: backer.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}