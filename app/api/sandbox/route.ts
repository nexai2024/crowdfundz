import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const sandboxes = await prisma.demoSandbox.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sandboxes);
  } catch (error) {
    console.error("Sandbox GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sandboxes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, title, sandboxUrl, environment, embedCode } = body;

    if (!campaignId || !title || !sandboxUrl) {
      return NextResponse.json({ error: "Missing required sandbox parameters" }, { status: 400 });
    }

    const sandbox = await prisma.demoSandbox.create({
      data: {
        campaignId,
        title,
        sandboxUrl,
        environment: environment || "Node.js / React",
        embedCode: embedCode || null,
        status: "RUNNING",
      },
    });

    return NextResponse.json(sandbox);
  } catch (error) {
    console.error("Sandbox POST error:", error);
    return NextResponse.json({ error: "Failed to create sandbox" }, { status: 500 });
  }
}
