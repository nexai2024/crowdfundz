import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { creatorPayoutCents, splitCardFeeCents } from "@/lib/platform-fee";

function wholeDollars(value: unknown): number | null {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000) return null;
  return amount;
}

export function parseGitHubPullRequest(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.hostname !== "github.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[2] !== "pull") return null;
  const number = Number(parts[3]);
  if (!Number.isInteger(number) || number < 1) return null;
  if (!/^[\w.-]+$/.test(parts[0] ?? "") || !/^[\w.-]+$/.test(parts[1] ?? "")) return null;
  return { owner: parts[0] as string, repo: parts[1] as string, number };
}

export function pledgeAllocations(
  priceUsd: number,
  phaseIds: Set<string>,
  raw: unknown
): { ok: true; rows: Array<{ phaseId: string; amountUsd: number }> } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Choose at least one milestone" };
  }

  const rows: Array<{ phaseId: string; amountUsd: number }> = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Each milestone needs an amount" };
    }
    const record = item as { phaseId?: unknown; amountUsd?: unknown };
    const phaseId = typeof record.phaseId === "string" ? record.phaseId : "";
    const amountUsd = wholeDollars(record.amountUsd);
    if (!phaseIds.has(phaseId)) {
      return { ok: false, error: "That milestone is not on this project" };
    }
    if (seen.has(phaseId)) {
      return { ok: false, error: "A milestone can only be selected once" };
    }
    if (amountUsd === null) {
      return { ok: false, error: "Each selected milestone needs a whole-dollar amount" };
    }
    seen.add(phaseId);
    rows.push({ phaseId, amountUsd });
  }

  const sum = rows.reduce((total, row) => total + row.amountUsd, 0);
  if (sum !== priceUsd) {
    return { ok: false, error: `Milestone amounts must add up to $${priceUsd}` };
  }
  return { ok: true, rows };
}

export async function githubPullRequestMerged(
  pullRequestUrl: string
): Promise<{ merged: boolean } | { error: string }> {
  const parsed = parseGitHubPullRequest(pullRequestUrl);
  if (!parsed) {
    return {
      error: "Use a GitHub pull request URL, like https://github.com/org/repo/pull/12",
    };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "crowdventure",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`,
    { headers }
  );
  if (!response.ok) {
    return {
      error:
        "GitHub could not confirm that pull request. A public pull request can be checked without a token.",
    };
  }
  const body = (await response.json()) as { merged?: boolean };
  return { merged: body.merged === true };
}

export async function stripeFeeCentsForCharge(chargeId: string) {
  if (!stripe) return null;
  const charge = await stripe.charges.retrieve(chargeId, { expand: ["balance_transaction"] });
  const txn = charge.balance_transaction;
  if (!txn || typeof txn === "string") return null;
  return txn.fee;
}

export async function settlePledgePayout(backerId: string) {
  if (!stripe) return;

  const backer = await prisma.backer.findUnique({
    where: { id: backerId },
    include: {
      allocations: { orderBy: { createdAt: "asc" } },
      campaign: { select: { creator: { select: { stripeConnectAccountId: true } } } },
    },
  });
  if (!backer || backer.status !== "SUCCEEDED" || !backer.stripeChargeId) return;

  let cardFeeCents = backer.stripeFeeCents;
  if (cardFeeCents == null) {
    cardFeeCents = await stripeFeeCentsForCharge(backer.stripeChargeId);
    if (cardFeeCents == null) return;
    await prisma.backer.update({
      where: { id: backer.id },
      data: { stripeFeeCents: cardFeeCents },
    });
  }

  const missingFee = backer.allocations.some((row) => row.cardFeeCents == null);
  if (backer.fundingMode === "MILESTONE" && missingFee) {
    const shares = splitCardFeeCents(
      backer.allocations.map((row) => row.amountUsd),
      cardFeeCents
    );
    for (let index = 0; index < backer.allocations.length; index += 1) {
      const row = backer.allocations[index];
      if (!row || row.cardFeeCents != null) continue;
      await prisma.pledgeAllocation.update({
        where: { id: row.id },
        data: { cardFeeCents: shares[index] ?? 0 },
      });
    }
  }

  if (backer.fundingMode !== "INSTANT" || backer.stripeTransferId) return;
  const destination = backer.campaign.creator.stripeConnectAccountId;
  if (!destination) return;

  const transferCents = creatorPayoutCents(backer.amountUsd, cardFeeCents);
  if (transferCents < 1) return;

  const transfer = await stripe.transfers.create(
    {
      amount: transferCents,
      currency: "usd",
      destination,
      source_transaction: backer.stripeChargeId,
    },
    { idempotencyKey: `pledge-instant-${backer.id}` }
  );
  await prisma.backer.updateMany({
    where: { id: backer.id, stripeTransferId: null },
    data: { stripeTransferId: transfer.id },
  });
}

export async function releaseSignedAllocations(phaseId: string) {
  if (!stripe) return { releasedUsd: 0, error: "Payments are not configured yet." };

  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    select: { pullRequestMergedAt: true },
  });
  if (!phase?.pullRequestMergedAt) return { releasedUsd: 0, error: null };

  const allocations = await prisma.pledgeAllocation.findMany({
    where: {
      phaseId,
      status: { in: ["HELD", "RELEASING"] },
      signedOffAt: { not: null },
      stripeTransferId: null,
      backer: { status: "SUCCEEDED", fundingMode: "MILESTONE" },
    },
    include: {
      backer: {
        select: {
          id: true,
          amountUsd: true,
          stripeChargeId: true,
          campaign: { select: { creator: { select: { stripeConnectAccountId: true } } } },
        },
      },
    },
  });

  let releasedUsd = 0;
  let error: string | null = null;
  for (const allocation of allocations) {
    const destination = allocation.backer.campaign.creator.stripeConnectAccountId;
    const chargeId = allocation.backer.stripeChargeId;
    if (!destination || !chargeId) {
      error = "The creator has not connected a payout account yet.";
      continue;
    }

    if (allocation.cardFeeCents == null) {
      await settlePledgePayout(allocation.backer.id);
    }
    const priced = await prisma.pledgeAllocation.findUnique({
      where: { id: allocation.id },
      select: { cardFeeCents: true },
    });
    if (priced?.cardFeeCents == null) {
      error = "The card fee is not available yet, so this amount stays held.";
      continue;
    }

    const transferCents = creatorPayoutCents(allocation.amountUsd, priced.cardFeeCents);
    if (transferCents < 1) {
      error = "This slice does not cover the platform fee and card fee.";
      continue;
    }

    await prisma.pledgeAllocation.update({
      where: { id: allocation.id },
      data: { status: "RELEASING" },
    });

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: transferCents,
          currency: "usd",
          destination,
          source_transaction: chargeId,
        },
        { idempotencyKey: `pledge-allocation-${allocation.id}` }
      );
      await prisma.pledgeAllocation.update({
        where: { id: allocation.id },
        data: {
          status: "RELEASED",
          stripeTransferId: transfer.id,
          releasedAt: new Date(),
        },
      });
      releasedUsd += allocation.amountUsd;
    } catch (cause) {
      console.error("Pledge release failed", allocation.id, cause);
      await prisma.pledgeAllocation.updateMany({
        where: { id: allocation.id, status: "RELEASING", stripeTransferId: null },
        data: { status: "HELD" },
      });
      error = "The transfer to the creator did not go through. Sign off again to retry.";
    }
  }

  return { releasedUsd, error };
}

export function allocationTotals(
  allocations: Array<{ amountUsd: number; status: string }>
) {
  let heldUsd = 0;
  let releasedUsd = 0;
  for (const allocation of allocations) {
    if (allocation.status === "HELD" || allocation.status === "RELEASING") {
      heldUsd += allocation.amountUsd;
    } else if (allocation.status === "RELEASED") {
      releasedUsd += allocation.amountUsd;
    }
  }
  return { heldUsd, releasedUsd };
}
