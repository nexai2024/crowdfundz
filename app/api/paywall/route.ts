import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { paywalls: { orderBy: { requiredRaisedUsd: "asc" } } },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const paywalls = campaign.paywalls.map((pw) => ({
      ...pw,
      locked: campaign.totalRaised < pw.requiredRaisedUsd,
    }));

    return NextResponse.json(paywalls);
  } catch (error) {
    console.error("Paywall GET error:", error);
    return NextResponse.json({ error: "Failed to fetch paywalls" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, title, description, requiredRaisedUsd, contentUrl } = body;

    if (!campaignId || !title || !contentUrl || !requiredRaisedUsd) {
      return NextResponse.json({ error: "Missing required milestone paywall details" }, { status: 400 });
    }

    const paywall = await prisma.milestonePaywall.create({
      data: {
        campaignId,
        title,
        description: description || "Exclusive milestone backer access",
        requiredRaisedUsd: Number(requiredRaisedUsd),
        contentUrl,
      },
    });

    return NextResponse.json(paywall);
  } catch (error) {
    console.error("Paywall POST error:", error);
    return NextResponse.json({ error: "Failed to create milestone paywall" }, { status: 500 });
  }
}
