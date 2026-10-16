import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sameOriginOrForbid } from "@/lib/http";
import { releaseSignedAllocations } from "@/lib/escrow";

export async function POST(request: Request) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  const body = (await request.json().catch(() => null)) as {
    sessionId?: unknown;
    phaseId?: unknown;
  } | null;
  if (!body || typeof body.sessionId !== "string" || typeof body.phaseId !== "string") {
    return NextResponse.json({ error: "Pledge session and milestone are required" }, { status: 400 });
  }

  const allocation = await prisma.pledgeAllocation.findFirst({
    where: {
      phaseId: body.phaseId,
      backer: { stripeSessionId: body.sessionId, status: "SUCCEEDED", fundingMode: "MILESTONE" },
    },
    include: { phase: { select: { pullRequestMergedAt: true } } },
  });
  if (!allocation || (allocation.status !== "HELD" && allocation.status !== "RELEASED")) {
    return NextResponse.json({ error: "That milestone is not holding this pledge" }, { status: 404 });
  }
  if (allocation.status === "RELEASED") {
    return NextResponse.json({ ok: true, released: true });
  }

  if (!allocation.signedOffAt) {
    await prisma.pledgeAllocation.update({
      where: { id: allocation.id },
      data: { signedOffAt: new Date() },
    });
  }

  if (!allocation.phase.pullRequestMergedAt) {
    return NextResponse.json({
      ok: true,
      released: false,
      message: "Signed off. The funds stay held until the pull request is merged.",
    });
  }

  const release = await releaseSignedAllocations(allocation.phaseId);
  if (release.error && release.releasedUsd === 0) {
    return NextResponse.json({ error: release.error }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    released: release.releasedUsd > 0,
    message: release.releasedUsd > 0 ? "Released to the creator." : release.error,
  });
}
