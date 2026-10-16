import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getSessionUser } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";

export async function POST(request: Request) {
  const originBlock = sameOriginOrForbid(request);
  if (originBlock) return originBlock;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add STRIPE_SECRET_KEY to turn payouts on." },
      { status: 503 }
    );
  }

  try {
    const creator = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, stripeConnectAccountId: true },
    });
    if (!creator) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    let accountId = creator.stripeConnectAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: creator.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { userId: creator.id },
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: creator.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const origin = request.headers.get("origin") || process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/account`,
      return_url: `${origin}/account`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (error) {
    console.error("Stripe Connect onboarding failed:", error);
    return NextResponse.json({ error: "Could not start payout setup" }, { status: 500 });
  }
}
