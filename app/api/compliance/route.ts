import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    let check = await prisma.complianceCheck.findUnique({
      where: { campaignId },
    });

    if (!check) {
      check = await prisma.complianceCheck.create({
        data: {
          campaignId,
          disclaimerVerified: true,
          kycStatus: "VERIFIED",
          jurisdiction: "US-DELAWARE",
          taxFormFiled: true,
        },
      });
    }

    return NextResponse.json(check);
  } catch (error) {
    console.error("Compliance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch compliance status" }, { status: 500 });
  }
}
