import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { releaseSignedAllocations, settlePledgePayout } from "@/lib/escrow";
import { applyPaidCheckoutSession } from "@/lib/pledges";
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
    console.error("Webhook signature failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await applyPaidCheckoutSession(session);
    if ("backerId" in result && result.backerId) await settlePledgePayout(result.backerId);
  } else if (event.type === "charge.updated") {
    const charge = event.data.object as Stripe.Charge;
    await settleCharge(charge);
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

async function settleCharge(charge: Stripe.Charge) {
  const intentId = paymentIntentId(charge.payment_intent);
  if (!intentId) return;
  const backer = await prisma.backer.findUnique({
    where: { stripePaymentIntentId: intentId },
    select: { id: true },
  });
  if (backer) await settlePledgePayout(backer.id);
}

async function revokePledge(intentId: string | null, status: "REFUNDED" | "DISPUTED") {
  if (!intentId) return;
  const backer = await prisma.backer.findUnique({ where: { stripePaymentIntentId: intentId } });
  if (!backer || backer.status === status || backer.status === "REFUNDED") return;

  const counted = await prisma.backer.updateMany({
    where: { id: backer.id, status: "SUCCEEDED" },
    data: { status, entitledAt: null },
  });
  const changed =
    counted.count === 1 ||
    (
      await prisma.backer.updateMany({
        where: { id: backer.id, status: { notIn: [status, "REFUNDED", "SUCCEEDED"] } },
        data: { status, entitledAt: null },
      })
    ).count === 1;
  if (!changed) return;

  await prisma.pledgeAllocation.updateMany({
    where: { backerId: backer.id, status: { in: ["PENDING", "HELD", "RELEASING"] } },
    data: { status: status === "DISPUTED" ? "DISPUTED" : "REFUNDED" },
  });
  if (counted.count === 1) {
    await prisma.$executeRaw`
      UPDATE "Campaign"
      SET "totalRaised" = GREATEST(0, "totalRaised" - ${backer.amountUsd}),
          "backerCount" = GREATEST(0, "backerCount" - 1)
      WHERE "id" = ${backer.campaignId}
    `;
  }
}

async function restorePledge(intentId: string | null) {
  if (!intentId) return;
  const backer = await prisma.backer.findUnique({ where: { stripePaymentIntentId: intentId } });
  if (!backer || backer.status !== "DISPUTED") return;

  const restored = await prisma.backer.updateMany({
    where: { id: backer.id, status: "DISPUTED" },
    data: { status: "SUCCEEDED", entitledAt: new Date() },
  });
  if (restored.count !== 1) return;

  await prisma.pledgeAllocation.updateMany({
    where: { backerId: backer.id, status: "DISPUTED" },
    data: { status: "HELD" },
  });
  const signed = await prisma.pledgeAllocation.findMany({
    where: { backerId: backer.id, status: "HELD", signedOffAt: { not: null } },
    select: { phaseId: true },
  });
  for (const phaseId of Array.from(new Set(signed.map((row) => row.phaseId)))) {
    await releaseSignedAllocations(phaseId);
  }
  await prisma.campaign.update({
    where: { id: backer.campaignId },
    data: {
      totalRaised: { increment: backer.amountUsd },
      backerCount: { increment: 1 },
    },
  });
}
