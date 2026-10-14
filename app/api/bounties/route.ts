import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const bounties = await prisma.bounty.findMany({
      where: { campaignId },
      include: { submissions: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bounties);
  } catch (error) {
    console.error("Bounty GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bounties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, title, description, rewardUsd } = body;

    if (!campaignId || !title || !description || !rewardUsd) {
      return NextResponse.json({ error: "Missing required bounty fields" }, { status: 400 });
    }

    const bounty = await prisma.bounty.create({
      data: {
        campaignId,
        title,
        description,
        rewardUsd: Number(rewardUsd),
        status: "OPEN",
      },
    });

    return NextResponse.json(bounty);
  } catch (error) {
    console.error("Bounty POST error:", error);
    return NextResponse.json({ error: "Failed to create bounty" }, { status: 500 });
  }
}
