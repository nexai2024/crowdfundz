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
    await markPledgePaid(session);
  } else if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.refunded) await revokePledge(paymentIntentId(charge.payment_intent), "REFUNDED");
  } else if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    await revokePledge(paymentIntentId(dispute.payment_intent), "DISPUTED");
  } else if (event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    if (dispute.status === "won") await restorePledge(paymentIntentId(dispute.payment_intent));
    if (dispute.status === "lost") await revokePledge(paymentIntentId(dispute.payment_intent), "REFUNDED");
  }

  return NextResponse.json({ received: true });
}

function paymentIntentId(value: string | Stripe.PaymentIntent | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function markPledgePaid(session: Stripe.Checkout.Session) {
  const backerId = session.metadata?.backerId;
  if (!backerId) return;

  const existing = await prisma.backer.findUnique({ where: { id: backerId } });
  if (!existing || existing.status === "SUCCEEDED") return;

  const amountPaid = session.amount_total ? Math.round(session.amount_total / 100) : existing.amountUsd;
  await prisma.backer.update({
    where: { id: existing.id },
    data: {
      status: "SUCCEEDED",
      email: (session.customer_details?.email || existing.email).toLowerCase(),
      entitledAt: new Date(),
      stripePaymentIntentId: paymentIntentId(session.payment_intent),
      amountUsd: amountPaid,
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

async function revokePledge(intentId: string | null, status: "REFUNDED" | "DISPUTED") {
  if (!intentId) return;
  const backer = await prisma.backer.findUnique({ where: { stripePaymentIntentId: intentId } });
  if (!backer || backer.status === status || backer.status === "REFUNDED") return;

  const wasCounted = backer.status === "SUCCEEDED";
  await prisma.backer.update({
    where: { id: backer.id },
    data: { status, entitledAt: null },
  });
  if (wasCounted) {
    await prisma.campaign.update({
      where: { id: backer.campaignId },
      data: {
        totalRaised: { decrement: backer.amountUsd },
        backerCount: { decrement: 1 },
      },
    });
  }
}

async function restorePledge(intentId: string | null) {
  if (!intentId) return;
  const backer = await prisma.backer.findUnique({ where: { stripePaymentIntentId: intentId } });
  if (!backer || backer.status !== "DISPUTED") return;

  await prisma.backer.update({
    where: { id: backer.id },
    data: { status: "SUCCEEDED", entitledAt: new Date() },
  });
  await prisma.campaign.update({
    where: { id: backer.campaignId },
    data: {
      totalRaised: { increment: backer.amountUsd },
      backerCount: { increment: 1 },
    },
  });
}
