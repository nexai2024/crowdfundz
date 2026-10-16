export const PLATFORM_FEE_PERCENT = 5;

/** Crowdventure's 5% of a whole-dollar amount, in cents. This is never reduced by Stripe fees. */
export function platformFeeCents(amountUsd: number) {
  return amountUsd * PLATFORM_FEE_PERCENT;
}

/**
 * Split a charge's Stripe fee across pledge slices so the shares add up to the exact fee.
 * The platform fee stays separate and is not part of this split.
 */
export function splitCardFeeCents(amountsUsd: number[], stripeFeeCents: number) {
  const totalUsd = amountsUsd.reduce((sum, amount) => sum + amount, 0);
  if (totalUsd <= 0 || amountsUsd.length === 0) return amountsUsd.map(() => 0);

  const exact = amountsUsd.map((amount) => (stripeFeeCents * amount) / totalUsd);
  const shares = exact.map((value) => Math.floor(value));
  let remainder = stripeFeeCents - shares.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index);

  for (const item of order) {
    if (remainder <= 0) break;
    shares[item.index] += 1;
    remainder -= 1;
  }
  return shares;
}

/** Cents the creator receives: pledge minus 5%, minus the Stripe fees assigned to this amount. */
export function creatorPayoutCents(amountUsd: number, cardFeeCents: number) {
  return Math.max(0, amountUsd * 100 - platformFeeCents(amountUsd) - cardFeeCents);
}
