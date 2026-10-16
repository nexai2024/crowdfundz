import { stripe } from "@/lib/stripe";

export async function recipientTransfersActive(accountId: string) {
  if (!stripe) return false;
  const account = await stripe.v2.core.accounts.retrieve(accountId, {
    include: ["configuration.recipient"],
  });
  return (
    account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status ===
    "active"
  );
}
