import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";
import { requiredText, wholeDollars } from "@/lib/studio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const bounties = await prisma.bounty.findMany({
      where: { campaignId },
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
    const body = (await req.json()) as {
      campaignId?: string;
      title?: string;
      description?: string;
      rewardUsd?: number;
    };
    const title = requiredText(body.title, 140);
    const description = requiredText(body.description, 2000);
    const rewardUsd = wholeDollars(body.rewardUsd);

    if (!body.campaignId || !title || !description || rewardUsd === null) {
      return NextResponse.json(
        { error: "A bounty needs a title, description, and whole-dollar reward" },
        { status: 400 }
      );
    }

    const owner = await ownerMutation(req, body.campaignId);
    if (owner) return owner;

    const bounty = await prisma.bounty.create({
      data: {
        campaignId: body.campaignId,
        title,
        description,
        rewardUsd,
        status: "OPEN",
      },
    });

    return NextResponse.json(bounty);
  } catch (error) {
    console.error("Bounty POST error:", error);
    return NextResponse.json({ error: "Failed to create bounty" }, { status: 500 });
  }
}
