import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, apiKey, commitMessage, editor, linesAdded, linesDeleted, fileChanged, commitHash } = body;

    if (!campaignId || !commitMessage) {
      return NextResponse.json({ error: "campaignId and commitMessage are required" }, { status: 400 });
    }

    if (apiKey) {
      const validKey = await prisma.ideApiKey.findUnique({ where: { key: apiKey } });
      if (!validKey) {
        return NextResponse.json({ error: "Invalid IDE API key" }, { status: 401 });
      }
    }

    const update = await prisma.ideUpdate.create({
      data: {
        campaignId,
        commitMessage,
        editor: editor || "VS Code",
        linesAdded: linesAdded || 0,
        linesDeleted: linesDeleted || 0,
        fileChanged: fileChanged || "src/index.ts",
        commitHash: commitHash || Math.random().toString(36).substring(2, 9),
      },
    });

    return NextResponse.json(update);
  } catch (error) {
    console.error("IDE Update POST error:", error);
    return NextResponse.json({ error: "Failed to ingest IDE update" }, { status: 500 });
  }
}
