import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, apiKey, commitMessage, editor, linesAdded, linesDeleted, fileChanged, commitHash } = body;

    if (!campaignId || !commitMessage || !apiKey) {
      return NextResponse.json(
        { error: "campaignId, commitMessage, and apiKey are required" },
        { status: 400 }
      );
    }

    const validKey = await prisma.ideApiKey.findUnique({ where: { key: apiKey } });
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
        commitMessage,
        editor: editor || "VS Code",
        linesAdded: Number(linesAdded) || 0,
        linesDeleted: Number(linesDeleted) || 0,
        fileChanged: fileChanged || null,
        commitHash: commitHash || null,
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
