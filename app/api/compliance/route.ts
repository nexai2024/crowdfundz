import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertCampaignOwner } from "@/lib/studio";

export async function GET(req: Request) {
  const campaignId = new URL(req.url).searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const owner = await assertCampaignOwner(campaignId);
  if (owner) return owner;

  try {
    const check = await prisma.complianceCheck.findUnique({ where: { campaignId } });
    return NextResponse.json(
      check ?? {
        campaignId,
        disclaimerVerified: false,
        kycStatus: "UNVERIFIED",
        jurisdiction: "UNSET",
        taxFormFiled: false,
      }
    );
  } catch (error) {
    console.error("Compliance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch compliance status" }, { status: 500 });
  }
}
