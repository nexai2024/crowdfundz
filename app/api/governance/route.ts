import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/current-user";
import { assertCampaignOwner } from "@/lib/studio";
import { sameOriginOrForbid } from "@/lib/http";
import { consumeRateLimit, requestIp } from "@/lib/waitlist-rate-limit";

export async function GET(req: Request) {
  const campaignId = new URL(req.url).searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const owner = await assertCampaignOwner(campaignId);
  if (owner) return owner;

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
  const origin = sameOriginOrForbid(req);
  if (origin) return origin;
  if (!(await consumeRateLimit("governance", requestIp(req), 20, 10 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Too many attempts from this network. Try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as {
      pollId?: string;
      backerEmail?: string;
      optionIndex?: number;
    };
    const user = await getSessionUser();
    const email = user?.email?.trim().toLowerCase() || "";
    const claimed = body.backerEmail?.trim().toLowerCase() || "";
    const optionIndex = body.optionIndex;

    if (!email) {
      return NextResponse.json(
        { error: "Sign in with the email on your pledge to vote." },
        { status: 401 }
      );
    }
    if (claimed && claimed !== email) {
      return NextResponse.json({ error: "Vote with the email on your account." }, { status: 403 });
    }
    if (!body.pollId || optionIndex === undefined) {
      return NextResponse.json(
        { error: "pollId and optionIndex are required" },
        { status: 400 }
      );
    }

    const poll = await prisma.governancePoll.findUnique({ where: { id: body.pollId } });
    if (!poll || poll.status !== "OPEN") {
      return NextResponse.json({ error: "That poll is not open" }, { status: 404 });
    }
    if (poll.expiresAt && poll.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "That poll is closed" }, { status: 400 });
    }
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json({ error: "Choose one of the listed options" }, { status: 400 });
    }

    const pledges = await prisma.backer.findMany({
      where: {
        campaignId: poll.campaignId,
        status: "SUCCEEDED",
        email: { equals: email, mode: "insensitive" },
      },
      select: { amountUsd: true },
    });
    if (pledges.length === 0) {
      return NextResponse.json(
        { error: "Only a confirmed backer on this project can vote" },
        { status: 403 }
      );
    }

    const vote = await prisma.governanceVote.create({
      data: {
        pollId: poll.id,
        backerEmail: email,
        optionIndex,
        weight: pledges.reduce((sum, pledge) => sum + pledge.amountUsd, 0),
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This email already voted" }, { status: 409 });
    }
    console.error("Governance POST error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
