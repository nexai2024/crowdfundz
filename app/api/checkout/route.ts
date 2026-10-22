import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { destinationChargesReady } from "@/lib/stripe-connect";
import { isAllowedAppOrigin } from "@/lib/hosts";
import { isEmailAddress, sameOriginOrForbid } from "@/lib/http";
import { pledgeAllocations } from "@/lib/escrow";
import { platformFeeCents } from "@/lib/platform-fee";
import { consumeRateLimit, requestIp } from "@/lib/waitlist-rate-limit";

type CheckoutBody = {
  tierId?: string;
  name?: string;
  handle?: string;
  message?: string;
  email?: string;
  subdomain?: string;
  slug?: string;
  origin?: string;
  fundingMode?: string;
  allocations?: unknown;
};

export async function POST(req: Request) {
  const originBlock = sameOriginOrForbid(req);
  if (originBlock) return originBlock;
  if (!(await consumeRateLimit("checkout", requestIp(req), 8, 10 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Too many checkout attempts from this network. Try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as CheckoutBody;
    const email = body.email?.trim().toLowerCase() || "";
    const subdomain = body.subdomain?.trim().toLowerCase() || "";
    const slug = body.slug?.trim() || "";
    const name = (body.name?.trim() || "Anonymous Backer").slice(0, 80);
    const handle = body.handle?.trim().replace(/^@/, "").slice(0, 40) || "";

    if (!body.tierId || !subdomain || !slug || !email) {
      return NextResponse.json(
        { error: "Tier, project, and email are required" },
        { status: 400 }
      );
    }
    if (!isEmailAddress(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (handle && !/^[a-zA-Z0-9_-]+$/.test(handle)) {
      return NextResponse.json({ error: "Handles can use letters, numbers, and dashes." }, { status: 400 });
    }

    const tier = await prisma.tier.findUnique({
      where: { id: body.tierId },
      include: { campaign: { include: { creator: true } }, _count: { select: { backers: { where: { status: { in: ["SUCCEEDED", "PENDING"] } } } } } },
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
    if (tier.campaign.status !== "ACTIVE") {
      return NextResponse.json({ error: "This project is not accepting pledges." }, { status: 403 });
    }

    if (tier.campaign.endsAt && tier.campaign.endsAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "This campaign has ended." }, { status: 403 });
    }

    if (tier.limit !== null && tier._count.backers >= tier.limit) {
      return NextResponse.json({ error: "This tier is sold out." }, { status: 403 });
    }

    const fundingMode = body.fundingMode === "milestone" ? "MILESTONE" : "INSTANT";
    let allocationRows: Array<{ phaseId: string; amountUsd: number }> = [];
    if (fundingMode === "MILESTONE") {
      const phases = await prisma.phase.findMany({
        where: { campaignId: tier.campaignId },
        select: { id: true },
      });
      const parsed = pledgeAllocations(
        tier.priceUsd,
        new Set(phases.map((phase) => phase.id)),
        body.allocations
      );
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      allocationRows = parsed.rows;
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Add STRIPE_SECRET_KEY to turn checkout on." },
        { status: 503 }
      );
    }

    const destination = tier.campaign.creator.stripeConnectAccountId;
    if (!destination) {
      return NextResponse.json(
        { error: "This creator has not connected a payout account yet." },
        { status: 503 }
      );
    }
    const transfersActive = await destinationChargesReady(destination);
    if (!transfersActive) {
      return NextResponse.json(
        { error: "This creator has not finished payout setup. Stripe still needs card payments enabled on their account." },
        { status: 503 }
      );
    }

    const backer = await prisma.backer.create({
      data: {
        campaignId: tier.campaignId,
        tierId: tier.id,
        email,
        name,
        handle: handle || null,
        message: body.message ? body.message.slice(0, 120) : null,
        amountUsd: tier.priceUsd,
        status: "PENDING",
        fundingMode,
        allocations:
          fundingMode === "MILESTONE"
            ? { create: allocationRows.map((row) => ({ ...row, status: "PENDING" as const })) }
            : undefined,
      },
    });

    const origin =
      body.origin && isAllowedAppOrigin(body.origin)
        ? body.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const originHost = new URL(origin).hostname;
    const onSubdomain = originHost === `${subdomain}.localhost` || originHost.startsWith(`${subdomain}.`);
    const path = onSubdomain ? `/${slug}` : `/${subdomain}/${slug}`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${tier.campaign.title}: ${tier.name}`,
                description:
                  fundingMode === "MILESTONE"
                    ? `${tier.description} Held for milestone release.`
                    : tier.description,
              },
              unit_amount: tier.priceUsd * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}${path}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${path}#tiers`,
        payment_intent_data:
          fundingMode === "INSTANT"
            ? {
                receipt_email: email,
                application_fee_amount: platformFeeCents(tier.priceUsd),
                on_behalf_of: destination,
                transfer_data: { destination },
              }
            : {
                receipt_email: email,
                on_behalf_of: destination,
              },
        metadata: {
          backerId: backer.id,
          campaignId: tier.campaignId,
          fundingMode,
        },
      });
    } catch (error) {
      await prisma.backer.delete({ where: { id: backer.id } });
      throw error;
    }

    await prisma.backer.update({
      where: { id: backer.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
