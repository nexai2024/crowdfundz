import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const loops = await prisma.collaborationLoop.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(loops);
  } catch (error) {
    console.error("Collaborations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch collaborations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, partnerSubdomain, partnerSlug, partnerTitle, discountPercentage } = body;

    if (!campaignId || !partnerSubdomain || !partnerSlug || !partnerTitle) {
      return NextResponse.json({ error: "Missing required collaboration details" }, { status: 400 });
    }

    const loop = await prisma.collaborationLoop.create({
      data: {
        campaignId,
        partnerSubdomain,
        partnerSlug,
        partnerTitle,
        discountPercentage: Number(discountPercentage || 10),
      },
    });

    return NextResponse.json(loop);
  } catch (error) {
    console.error("Collaborations POST error:", error);
    return NextResponse.json({ error: "Failed to create collaboration loop" }, { status: 500 });
  }
}
