import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isAllowedAppOrigin } from "@/lib/hosts";

type CheckoutBody = {
  tierId?: string;
  name?: string;
  handle?: string;
  message?: string;
  email?: string;
  subdomain?: string;
  slug?: string;
  origin?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const email = body.email?.trim() || "";
    const subdomain = body.subdomain?.trim().toLowerCase() || "";
    const slug = body.slug?.trim() || "";

    if (!body.tierId || !subdomain || !slug || !email) {
      return NextResponse.json(
        { error: "Tier, project, and email are required" },
        { status: 400 }
      );
    }

    const tier = await prisma.tier.findUnique({
      where: { id: body.tierId },
      include: { campaign: { include: { creator: true } } },
    });

    if (
      !tier ||
      tier.campaign.slug !== slug ||
      tier.campaign.creator.subdomain !== subdomain
    ) {
      return NextResponse.json(
        { error: "That pledge level does not belong to this project" },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Add STRIPE_SECRET_KEY to turn checkout on." },
        { status: 503 }
      );
    }

    const backer = await prisma.backer.create({
      data: {
        campaignId: tier.campaignId,
        tierId: tier.id,
        email,
        name: body.name?.trim() || "Anonymous Backer",
        handle: body.handle?.replace(/^@/, "") || null,
        message: body.message ? body.message.slice(0, 120) : null,
        amountUsd: tier.priceUsd,
        status: "PENDING",
      },
    });

    const origin =
      body.origin && isAllowedAppOrigin(body.origin)
        ? body.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const originHost = new URL(origin).hostname;
    const onSubdomain = originHost === `${subdomain}.localhost` || originHost.startsWith(`${subdomain}.`);
    const path = onSubdomain ? `/${slug}` : `/${subdomain}/${slug}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.campaign.title}: ${tier.name}`,
              description: tier.description,
            },
            unit_amount: tier.priceUsd * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}${path}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${path}#tiers`,
      metadata: {
        backerId: backer.id,
        campaignId: tier.campaignId,
      },
    });

    await prisma.backer.update({
      where: { id: backer.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
