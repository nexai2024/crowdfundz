import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";
import { optionalHttpUrl, requiredText } from "@/lib/studio";

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
    const body = (await req.json()) as {
      campaignId?: string;
      title?: string;
      sandboxUrl?: string;
      environment?: string;
      embedCode?: string;
    };
    const title = requiredText(body.title, 120);
    const sandboxUrl = optionalHttpUrl(body.sandboxUrl);
    const environment = requiredText(body.environment, 80) ?? "Node.js / React";
    const embedCode =
      typeof body.embedCode === "string" && body.embedCode.trim()
        ? body.embedCode.trim().slice(0, 2000)
        : null;

    if (!body.campaignId || !title || !sandboxUrl || sandboxUrl === "invalid") {
      return NextResponse.json(
        { error: "A sandbox needs a project, a title, and an http or https URL" },
        { status: 400 }
      );
    }

    const owner = await ownerMutation(req, body.campaignId);
    if (owner) return owner;

    const sandbox = await prisma.demoSandbox.create({
      data: {
        campaignId: body.campaignId,
        title,
        sandboxUrl,
        environment,
        embedCode,
        status: "RUNNING",
      },
    });

    return NextResponse.json(sandbox);
  } catch (error) {
    console.error("Sandbox POST error:", error);
    return NextResponse.json({ error: "Failed to create sandbox" }, { status: 500 });
  }
}
