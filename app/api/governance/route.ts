import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const polls = await prisma.governancePoll.findMany({
      where: { campaignId },
      include: { votes: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error("Governance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch governance polls" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pollId, backerEmail, optionIndex, weight } = body;

    if (!pollId || !backerEmail || optionIndex === undefined) {
      return NextResponse.json({ error: "pollId, backerEmail, and optionIndex are required" }, { status: 400 });
    }

    const vote = await prisma.governanceVote.create({
      data: {
        pollId,
        backerEmail,
        optionIndex: Number(optionIndex),
        weight: weight || 1,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Governance POST error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
