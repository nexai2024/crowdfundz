import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { settlePledgePayout, stripeFeeCentsForCharge } from "@/lib/escrow";

export type ReconcileAdjustment = {
  campaign: string;
  title: string;
  recordedRaised: number;
  confirmedRaised: number;
  recordedBackers: number;
  confirmedBackers: number;
};

export type ReconcileReport = {
  checked: number;
  confirmed: number;
  stillPending: number;
  payoutsSettled: number;
  adjustments: ReconcileAdjustment[];
  errors: string[];
};

function paymentIntentId(value: string | Stripe.PaymentIntent | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function chargeIdForIntent(intentId: string | null) {
  if (!intentId || !stripe) return null;
  const intent = await stripe.paymentIntents.retrieve(intentId);
  if (!intent.latest_charge) return null;
  return typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge.id;
}

/** Mark a paid Checkout Session on its pledge. A second call does not count the pledge twice. */
export async function applyPaidCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { applied: false as const, reason: "unpaid" as const };

  const backerId = session.metadata?.backerId;
  if (!backerId) return { applied: false as const, reason: "missing" as const };

  const existing = await prisma.backer.findUnique({ where: { id: backerId } });
  if (!existing || existing.status === "REFUNDED" || existing.status === "DISPUTED" || existing.status === "FAILED") {
    return { applied: false as const, reason: "missing" as const };
  }

  let applied = false;
  if (existing.status !== "SUCCEEDED") {
    const amountPaid = session.amount_total != null ? Math.round(session.amount_total / 100) : existing.amountUsd;
    const intentId = paymentIntentId(session.payment_intent);
    const chargeId = await chargeIdForIntent(intentId);
    const updated = await prisma.backer.updateMany({
      where: { id: existing.id, status: "PENDING" },
      data: {
        status: "SUCCEEDED",
        email: (session.customer_details?.email || existing.email).toLowerCase(),
        entitledAt: new Date(),
        stripePaymentIntentId: intentId,
        stripeChargeId: chargeId,
        stripeFeeCents: chargeId ? await stripeFeeCentsForCharge(chargeId) : null,
        amountUsd: amountPaid,
      },
    });
    if (updated.count === 1) {
      applied = true;
      await prisma.campaign.update({
        where: { id: existing.campaignId },
        data: {
          totalRaised: { increment: amountPaid },
          backerCount: { increment: 1 },
        },
      });
    }
  }

  await prisma.pledgeAllocation.updateMany({
    where: { backerId: existing.id, status: "PENDING" },
    data: { status: "HELD" },
  });

  return applied
    ? { applied: true as const, backerId: existing.id }
    : { applied: false as const, reason: "already" as const, backerId: existing.id };
}

export async function confirmCheckoutSession(sessionId: string) {
  if (!stripe) return { applied: false as const, reason: "unconfigured" as const };
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const result = await applyPaidCheckoutSession(session);
  if (result.applied && result.backerId) {
    try {
      await settlePledgePayout(result.backerId);
    } catch (error) {
      console.error(
        "Pledge payout did not settle",
        result.backerId,
        error instanceof Error ? error.message : error
      );
    }
  }
  return result;
}

async function settleOpenPayout(backerId: string) {
  const before = await prisma.backer.findUnique({
    where: { id: backerId },
    select: { stripeTransferId: true, fundingMode: true, stripeChargeId: true, stripeFeeCents: true },
  });
  if (!before?.stripeChargeId) return false;
  try {
    await settlePledgePayout(backerId);
  } catch (error) {
    console.error("Pledge payout did not settle", backerId, error instanceof Error ? error.message : error);
    return false;
  }
  if (before.fundingMode !== "INSTANT" || before.stripeTransferId) return false;
  const after = await prisma.backer.findUnique({
    where: { id: backerId },
    select: { stripeTransferId: true },
  });
  return Boolean(after?.stripeTransferId);
}

export async function reconcilePledges(campaignIds: string[]): Promise<ReconcileReport> {
  const report: ReconcileReport = {
    checked: 0,
    confirmed: 0,
    stillPending: 0,
    payoutsSettled: 0,
    adjustments: [],
    errors: [],
  };
  if (campaignIds.length === 0 || !stripe) return report;

  const pending = await prisma.backer.findMany({
    where: { campaignId: { in: campaignIds }, status: "PENDING", stripeSessionId: { not: null } },
    select: { id: true, stripeSessionId: true, amountUsd: true },
    take: 100,
    orderBy: { createdAt: "asc" },
  });

  for (const backer of pending) {
    if (!backer.stripeSessionId) continue;
    report.checked += 1;
    try {
      const before = await prisma.backer.findUnique({
        where: { id: backer.id },
        select: { stripeTransferId: true },
      });
      const result = await confirmCheckoutSession(backer.stripeSessionId);
      if (result.applied) report.confirmed += 1;
      else if (result.reason === "unpaid") report.stillPending += 1;
      if (!before?.stripeTransferId && "backerId" in result && result.backerId) {
        const after = await prisma.backer.findUnique({
          where: { id: result.backerId },
          select: { stripeTransferId: true },
        });
        if (after?.stripeTransferId) report.payoutsSettled += 1;
      }
    } catch (error) {
      report.errors.push(
        error instanceof Error ? error.message : `Could not check pledge ${backer.amountUsd}`
      );
    }
  }

  const unsettled = await prisma.backer.findMany({
    where: {
      campaignId: { in: campaignIds },
      status: "SUCCEEDED",
      fundingMode: "INSTANT",
      stripeChargeId: { not: null },
      stripeTransferId: null,
    },
    select: { id: true },
    take: 100,
  });
  for (const backer of unsettled) {
    if (await settleOpenPayout(backer.id)) report.payoutsSettled += 1;
  }

  const confirmed = await prisma.backer.groupBy({
    by: ["campaignId"],
    where: { campaignId: { in: campaignIds }, status: "SUCCEEDED" },
    _sum: { amountUsd: true },
    _count: { _all: true },
  });
  const confirmedByCampaign = new Map(
    confirmed.map((row) => [
      row.campaignId,
      { raised: row._sum.amountUsd ?? 0, backers: row._count._all },
    ])
  );
  const paidCampaigns = await prisma.backer.findMany({
    where: { campaignId: { in: campaignIds }, stripeSessionId: { not: null } },
    select: { campaignId: true },
    distinct: ["campaignId"],
  });
  const adjustable = new Set(paidCampaigns.map((row) => row.campaignId));
  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: Array.from(adjustable) } },
    select: {
      id: true,
      title: true,
      slug: true,
      totalRaised: true,
      backerCount: true,
      creator: { select: { subdomain: true } },
    },
  });

  for (const campaign of campaigns) {
    const totals = confirmedByCampaign.get(campaign.id) ?? { raised: 0, backers: 0 };
    if (campaign.totalRaised === totals.raised && campaign.backerCount === totals.backers) continue;
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { totalRaised: totals.raised, backerCount: totals.backers },
    });
    report.adjustments.push({
      campaign: `${campaign.creator.subdomain ?? "studio"}/${campaign.slug}`,
      title: campaign.title,
      recordedRaised: campaign.totalRaised,
      confirmedRaised: totals.raised,
      recordedBackers: campaign.backerCount,
      confirmedBackers: totals.backers,
    });
  }

  return report;
}
