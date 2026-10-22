import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";
import { optionalHttpUrl, requiredText, wholeDollars } from "@/lib/studio";

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
    const body = (await req.json()) as {
      campaignId?: string;
      sponsorName?: string;
      logoUrl?: string;
      websiteUrl?: string;
      tierName?: string;
      amountPaidUsd?: number;
    };
    const sponsorName = requiredText(body.sponsorName, 80);
    const logoUrl = optionalHttpUrl(body.logoUrl);
    const websiteUrl = optionalHttpUrl(body.websiteUrl);
    const tierName = requiredText(body.tierName, 40) ?? "Gold Sponsor";
    const amountPaidUsd = wholeDollars(body.amountPaidUsd ?? 250);

    if (
      !body.campaignId ||
      !sponsorName ||
      !logoUrl ||
      logoUrl === "invalid" ||
      !websiteUrl ||
      websiteUrl === "invalid" ||
      amountPaidUsd === null
    ) {
      return NextResponse.json(
        { error: "A sponsor needs a name, http or https logo and website, and a whole-dollar amount" },
        { status: 400 }
      );
    }

    const owner = await ownerMutation(req, body.campaignId);
    if (owner) return owner;

    const sponsor = await prisma.sponsorSlot.create({
      data: {
        campaignId: body.campaignId,
        sponsorName,
        logoUrl,
        websiteUrl,
        tierName,
        amountPaidUsd,
        active: true,
      },
    });

    return NextResponse.json(sponsor);
  } catch (error) {
    console.error("Sponsors POST error:", error);
    return NextResponse.json({ error: "Failed to register sponsor" }, { status: 500 });
  }
}
