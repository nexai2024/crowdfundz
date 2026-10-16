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

  let country = "us";
  try {
    const body = (await request.json()) as { country?: string };
    if (typeof body.country === "string" && body.country.trim()) {
      country = body.country.trim().toLowerCase();
    }
  } catch {
    country = "us";
  }
  if (!/^[a-z]{2}$/.test(country)) {
    return NextResponse.json({ error: "Choose a two-letter country code." }, { status: 400 });
  }

  try {
    const creator = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, stripeConnectAccountId: true },
    });
    if (!creator) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    let accountId = creator.stripeConnectAccountId;
    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
        display_name: creator.name || creator.email,
        contact_email: creator.email,
        dashboard: "express",
        identity: { country },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: { requested: true },
              },
            },
          },
        },
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
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
    const link = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          refresh_url: `${origin}/account`,
          return_url: `${origin}/account`,
        },
      },
    });

    return NextResponse.json({ url: link.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start payout setup";
    console.error("Stripe Connect onboarding failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
