import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const sponsors = await prisma.sponsorSlot.findMany({
      where: { campaignId, active: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sponsors);
  } catch (error) {
    console.error("Sponsors GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, sponsorName, logoUrl, websiteUrl, tierName, amountPaidUsd } = body;

    if (!campaignId || !sponsorName || !logoUrl || !websiteUrl) {
      return NextResponse.json({ error: "Missing required sponsor details" }, { status: 400 });
    }

    const owner = await ownerMutation(req, campaignId);
    if (owner) return owner;

    const sponsor = await prisma.sponsorSlot.create({
      data: {
        campaignId,
        sponsorName,
        logoUrl,
        websiteUrl,
        tierName: tierName || "Gold Sponsor",
        amountPaidUsd: Number(amountPaidUsd || 250),
        active: true,
      },
    });

    return NextResponse.json(sponsor);
  } catch (error) {
    console.error("Sponsors POST error:", error);
    return NextResponse.json({ error: "Failed to register sponsor" }, { status: 500 });
  }
}
