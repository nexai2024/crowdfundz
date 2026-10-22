import { NextResponse } from "next/server";
import { reconcilePledges } from "@/lib/pledges";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Vercel Cron authorization header check
    if (!process.env.CRON_SECRET || req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      select: { id: true },
    });

    const report = await reconcilePledges(campaigns.map(c => c.id));
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error("Cron reconcile error:", error);
    return NextResponse.json({ error: "Reconcile failed" }, { status: 500 });
  }
}
