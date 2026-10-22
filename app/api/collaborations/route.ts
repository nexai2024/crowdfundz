import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";
import { requiredText } from "@/lib/studio";

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
    const body = (await req.json()) as {
      campaignId?: string;
      partnerSubdomain?: string;
      partnerSlug?: string;
      partnerTitle?: string;
      discountPercentage?: number;
    };
    const partnerSubdomain = requiredText(body.partnerSubdomain, 32)?.toLowerCase() ?? null;
    const partnerSlug = requiredText(body.partnerSlug, 50)?.toLowerCase() ?? null;
    const partnerTitle = requiredText(body.partnerTitle, 120);
    const discount =
      body.discountPercentage === undefined || body.discountPercentage === null
        ? 10
        : Number(body.discountPercentage);

    if (!body.campaignId || !partnerSubdomain || !partnerSlug || !partnerTitle) {
      return NextResponse.json({ error: "Missing required collaboration details" }, { status: 400 });
    }
    if (!Number.isInteger(discount) || discount < 0 || discount > 100) {
      return NextResponse.json({ error: "Discount must be a whole number from 0 to 100" }, { status: 400 });
    }

    const owner = await ownerMutation(req, body.campaignId);
    if (owner) return owner;

    const loop = await prisma.collaborationLoop.create({
      data: {
        campaignId: body.campaignId,
        partnerSubdomain,
        partnerSlug,
        partnerTitle,
        discountPercentage: discount,
      },
    });

    return NextResponse.json(loop);
  } catch (error) {
    console.error("Collaborations POST error:", error);
    return NextResponse.json({ error: "Failed to create collaboration loop" }, { status: 500 });
  }
}
