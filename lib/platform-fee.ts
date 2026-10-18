export const PLATFORM_FEE_PERCENT = 5;

/** Crowdventure's 5% application fee on a whole-dollar amount, in cents. */
export function platformFeeCents(amountUsd: number) {
  return amountUsd * PLATFORM_FEE_PERCENT;
}

/** Cents the creator receives: the pledge minus the 5% application fee. */
export function creatorPayoutCents(amountUsd: number) {
  return Math.max(0, amountUsd * 100 - platformFeeCents(amountUsd));
}
