import { stripe } from "@/lib/stripe";

/** Merchant of record so Stripe bills this account, plus transfers so it can receive the pledge. */
export const destinationAccountConfiguration = {
  merchant: {
    capabilities: {
      card_payments: { requested: true },
    },
  },
  recipient: {
    capabilities: {
      stripe_balance: {
        stripe_transfers: { requested: true },
      },
    },
  },
} as const;

/**
 * Express accounts cannot bill fees with fees_collector "stripe".
 * on_behalf_of on each charge makes the destination the settlement merchant,
 * so Stripe debits that account for processing.
 */
export const destinationResponsibilities = {
  fees_collector: "application_express",
  losses_collector: "application",
} as const;

export async function prepareDestinationAccount(accountId: string) {
  if (!stripe) return;
  await stripe.v2.core.accounts.update(accountId, {
    configuration: destinationAccountConfiguration,
  });
}

export async function destinationChargesReady(accountId: string) {
  if (!stripe) return false;
  const account = await stripe.v2.core.accounts.retrieve(accountId, {
    include: ["configuration.merchant", "configuration.recipient"],
  });
  const cardsActive =
    account.configuration?.merchant?.capabilities?.card_payments?.status === "active";
  const transfersActive =
    account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status ===
    "active";
  return cardsActive && transfersActive;
}
