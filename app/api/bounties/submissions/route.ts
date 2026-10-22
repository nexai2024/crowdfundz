import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmailAddress } from "@/lib/http";
import { consumeRateLimit, requestIp } from "@/lib/waitlist-rate-limit";

export async function POST(req: Request) {
  if (!(await consumeRateLimit("bounty-submission", requestIp(req), 10, 10 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Too many attempts from this network. Try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as {
      bountyId?: string;
      contributorName?: string;
      contributorEmail?: string;
      submissionUrl?: string;
    };

    const bountyId = body.bountyId;
    const contributorName = typeof body.contributorName === "string" ? body.contributorName.trim() : "";
    const contributorEmail = typeof body.contributorEmail === "string" ? body.contributorEmail.trim().toLowerCase() : "";
    const submissionUrl = typeof body.submissionUrl === "string" ? body.submissionUrl.trim() : "";

    if (!bountyId || !contributorName || !contributorEmail || !submissionUrl) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!isEmailAddress(contributorEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!submissionUrl.startsWith("http://") && !submissionUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 });
    }

    const bounty = await prisma.bounty.findUnique({ where: { id: bountyId } });
    if (!bounty || bounty.status !== "OPEN") {
      return NextResponse.json({ error: "This bounty is not open." }, { status: 404 });
    }

    const submission = await prisma.bountySubmission.create({
      data: {
        bountyId,
        contributorName,
        contributorEmail,
        submissionUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Bounty submission error:", error);
    return NextResponse.json({ error: "Failed to submit bounty" }, { status: 500 });
  }
}
