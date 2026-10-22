import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, apiKey, commitMessage, editor, linesAdded, linesDeleted, fileChanged, commitHash } = body;

    const message = typeof commitMessage === "string" ? commitMessage.trim().slice(0, 500) : "";
    const key = typeof apiKey === "string" ? apiKey.trim() : "";
    const bounded = (value: unknown) => {
      const amount = Number(value);
      if (!Number.isFinite(amount)) return 0;
      return Math.max(0, Math.min(1_000_000, Math.trunc(amount)));
    };

    if (!campaignId || !message || !key) {
      return NextResponse.json(
        { error: "campaignId, commitMessage, and apiKey are required" },
        { status: 400 }
      );
    }

    const validKey = await prisma.ideApiKey.findUnique({ where: { key } });
    if (!validKey) {
      return NextResponse.json({ error: "Invalid IDE API key" }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorId: true },
    });
    if (!campaign || campaign.creatorId !== validKey.userId) {
      return NextResponse.json({ error: "This key does not belong to the project" }, { status: 403 });
    }

    const update = await prisma.ideUpdate.create({
      data: {
        campaignId,
        commitMessage: message,
        editor: typeof editor === "string" && editor.trim() ? editor.trim().slice(0, 40) : "VS Code",
        linesAdded: bounded(linesAdded),
        linesDeleted: bounded(linesDeleted),
        fileChanged: typeof fileChanged === "string" && fileChanged.trim() ? fileChanged.trim().slice(0, 240) : null,
        commitHash: typeof commitHash === "string" && commitHash.trim() ? commitHash.trim().slice(0, 64) : null,
      },
    });

    const latest = await prisma.buildMetric.findFirst({
      where: { campaignId },
      orderBy: { recordedAt: "desc" },
    });
    if (!latest) {
      await prisma.buildMetric.create({
        data: { campaignId, pageViews: 0, uniqueUsers: 0, commitsCount: 1, weeklyGrowth: 0 },
      });
    } else {
      await prisma.buildMetric.update({
        where: { id: latest.id },
        data: { commitsCount: { increment: 1 } },
      });
    }

    return NextResponse.json(update);
  } catch (error) {
    console.error("IDE Update POST error:", error);
    return NextResponse.json({ error: "Failed to ingest IDE update" }, { status: 500 });
  }
}
