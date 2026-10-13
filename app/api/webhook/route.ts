import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const backerId = session.metadata?.backerId;

    if (backerId) {
      const existing = await prisma.backer.findUnique({ where: { id: backerId } });
      if (existing && existing.status !== "SUCCEEDED") {
        const amountPaid = session.amount_total
          ? Math.round(session.amount_total / 100)
          : existing.amountUsd;

        await prisma.backer.update({
          where: { id: backerId },
          data: {
            status: "SUCCEEDED",
            email: session.customer_details?.email || existing.email,
          },
        });
        await prisma.campaign.update({
          where: { id: existing.campaignId },
          data: {
            totalRaised: { increment: amountPaid },
            backerCount: { increment: 1 },
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
