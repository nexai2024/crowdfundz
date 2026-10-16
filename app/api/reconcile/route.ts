import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { reconcilePledges } from "@/lib/pledges";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const originBlock = sameOriginOrForbid(request);
  if (originBlock) return originBlock;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add STRIPE_SECRET_KEY to reconcile pledges." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { scope?: string };
  const platform = body.scope === "platform";
  if (platform && !isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: "Platform reconcile is limited to operators." }, { status: 403 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: platform ? undefined : { creatorId: user.id },
    select: { id: true },
  });
  const report = await reconcilePledges(campaigns.map((campaign) => campaign.id));
  return NextResponse.json(report);
}
