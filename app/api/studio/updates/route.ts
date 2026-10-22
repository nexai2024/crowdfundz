import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";
import { requiredText } from "@/lib/studio";
import { sendTransactionalEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      campaignId?: string;
      title?: string;
      content?: string;
    };

    const title = requiredText(body.title, 140);
    const content = requiredText(body.content, 5000);

    if (!body.campaignId || !title || !content) {
      return NextResponse.json(
        { error: "A title and content are required" },
        { status: 400 }
      );
    }

    const owner = await ownerMutation(req, body.campaignId);
    if (owner) return owner;

    const campaign = await prisma.campaign.findUnique({
      where: { id: body.campaignId },
      include: { creator: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const update = await prisma.makerUpdate.create({
      data: {
        campaignId: body.campaignId,
        title,
        content,
      },
    });

    const backers = await prisma.backer.findMany({
      where: { campaignId: body.campaignId, status: "SUCCEEDED" },
      select: { email: true, name: true },
      distinct: ['email']
    });

    for (const backer of backers) {
      try {
        await sendTransactionalEmail({
          to: backer.email,
          subject: `Update from ${campaign.title}: ${title}`,
          text: `Hi ${backer.name},\n\nHere is a new update on ${campaign.title}:\n\n${title}\n\n${content}\n\nCheers,\n${campaign.creator.name || "The Maker"}`,
        });
      } catch (err) {
        console.error(`Could not email ${backer.email}`, err);
      }
    }

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("Maker update POST error:", error);
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
  }
}
