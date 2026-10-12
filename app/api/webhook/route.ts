import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const backerId = session.metadata?.backerId;

    if (backerId) {
      const amountPaid = session.amount_total ? Math.round(session.amount_total / 100) : 2;

      // Update backer record to SUCCEEDED and refresh customer email
      await prisma.$transaction([
        prisma.backer.update({
          where: { id: backerId },
          data: {
            status: "SUCCEEDED",
            email: session.customer_details?.email || "anonymous@backer.com",
            stripePaymentId: session.payment_intent as string,
          },
        }),
        prisma.campaignMetrics.upsert({
          where: { id: "protocol100" },
          update: {
            totalRaised: { increment: amountPaid },
            backerCount: { increment: 1 },
          },
          create: {
            id: "protocol100",
            totalRaised: amountPaid,
            backerCount: 1,
            targetGoal: 5000,
          },
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}