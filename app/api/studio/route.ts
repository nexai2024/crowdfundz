import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sameOriginOrForbid } from "@/lib/http";
import {
  ownedCampaign,
  optionalHttpUrl,
  requiredText,
  wholeDollars,
} from "@/lib/studio";

const STATUSES = new Set(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]);
const TASK_STATUSES = new Set(["TODO", "DOING", "DONE"]);
const EDITORS = new Set(["Cursor", "VS Code", "Other"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || typeof body.slug !== "string" || typeof body.action !== "string") {
    return NextResponse.json({ error: "Project and action are required" }, { status: 400 });
  }

  const owned = await ownedCampaign(body.slug);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }
  const { user, campaign } = owned;

  try {
    switch (body.action) {
      case "saveBrief":
        return await saveBrief(campaign.id, body);
      case "saveDev":
        return await saveDev(campaign.id, user.id, body);
      case "addMilestone":
        return await addMilestone(campaign.id, body);
      case "deleteMilestone":
        return await deleteOwned(campaign.id, body, "phase");
      case "addTask":
        return await addTask(campaign.id, body);
      case "updateTask":
        return await updateTask(campaign.id, body);
      case "deleteTask":
        return await deleteOwned(campaign.id, body, "task");
      case "addTier":
        return await addTier(campaign.id, body);
      case "deleteTier":
        return await deleteTier(campaign.id, body);
      case "addFaq":
        return await addFaq(campaign.id, body);
      case "deleteFaq":
        return await deleteOwned(campaign.id, body, "faq");
      case "addSandbox":
        return await addSandbox(campaign.id, body);
      case "deleteSandbox":
        return await deleteOwned(campaign.id, body, "sandbox");
      case "addBounty":
        return await addBounty(campaign.id, body);
      case "deleteBounty":
        return await deleteOwned(campaign.id, body, "bounty");
      case "addSponsor":
        return await addSponsor(campaign.id, body);
      case "deleteSponsor":
        return await deleteOwned(campaign.id, body, "sponsor");
      default:
        return NextResponse.json({ error: "Unknown studio action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Studio action failed:", error);
    return NextResponse.json({ error: "Could not save this project" }, { status: 500 });
  }
}

async function saveBrief(campaignId: string, body: Record<string, unknown>) {
  const title = requiredText(body.title, 120);
  const tagline = requiredText(body.tagline, 280);
  const story = requiredText(body.story, 8000);
  const targetGoal = wholeDollars(body.targetGoal);
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : null;
  if (!title || !tagline || !story || targetGoal === null || !status) {
    return NextResponse.json(
      { error: "Title, tagline, story, goal, and status are required" },
      { status: 400 }
    );
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      title,
      tagline,
      story,
      targetGoal,
      status: status as "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED",
      eyebrow: optionalLine(body.eyebrow, 80),
      statusLabel: optionalLine(body.statusLabel, 80),
      manifestoTitle: optionalLine(body.manifestoTitle, 160),
      manifestoQuote: optionalLine(body.manifestoQuote, 400),
    },
  });
  return NextResponse.json({ ok: true });
}

async function saveDev(campaignId: string, userId: string, body: Record<string, unknown>) {
  const repoUrl = optionalHttpUrl(body.repoUrl);
  const vercelProjectUrl = optionalHttpUrl(body.vercelProjectUrl);
  const productionUrl = optionalHttpUrl(body.productionUrl);
  const previewUrl = optionalHttpUrl(body.previewUrl);
  if (
    repoUrl === "invalid" ||
    vercelProjectUrl === "invalid" ||
    productionUrl === "invalid" ||
    previewUrl === "invalid"
  ) {
    return NextResponse.json({ error: "Links must be http or https URLs" }, { status: 400 });
  }

  const repoBranch =
    typeof body.repoBranch === "string" && body.repoBranch.trim()
      ? body.repoBranch.trim().slice(0, 80)
      : "main";
  const ideEditor =
    typeof body.ideEditor === "string" && EDITORS.has(body.ideEditor) ? body.ideEditor : null;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { repoUrl, repoBranch, ideEditor, vercelProjectUrl, productionUrl, previewUrl },
  });

  if (body.rotateIdeKey === true) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const key = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    await prisma.ideApiKey.create({
      data: { userId, key, name: ideEditor ?? "IDE" },
    });
  }

  return NextResponse.json({ ok: true });
}

async function addMilestone(campaignId: string, body: Record<string, unknown>) {
  const title = requiredText(body.title, 120);
  const description = requiredText(body.description, 2000);
  const label = requiredText(body.label, 40);
  if (!title || !description || !label) {
    return NextResponse.json(
      { error: "A milestone needs a label, title, and description" },
      { status: 400 }
    );
  }
  const count = await prisma.phase.count({ where: { campaignId } });
  await prisma.phase.create({
    data: { campaignId, label, title, description, sortOrder: count },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function addTask(campaignId: string, body: Record<string, unknown>) {
  const title = requiredText(body.title, 140);
  if (!title) {
    return NextResponse.json({ error: "A task needs a title" }, { status: 400 });
  }
  const details = typeof body.details === "string" ? body.details.trim().slice(0, 2000) : "";
  const phaseId = await ownedPhaseId(campaignId, body.phaseId);
  if (phaseId === "invalid") {
    return NextResponse.json({ error: "That milestone is not on this project" }, { status: 400 });
  }
  const count = await prisma.task.count({ where: { campaignId } });
  await prisma.task.create({
    data: { campaignId, title, details, phaseId, sortOrder: count },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function updateTask(campaignId: string, body: Record<string, unknown>) {
  if (typeof body.id !== "string" || typeof body.status !== "string" || !TASK_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Choose a task status" }, { status: 400 });
  }
  const task = await prisma.task.findFirst({
    where: { id: body.id, campaignId },
    select: { id: true },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  await prisma.task.update({
    where: { id: task.id },
    data: { status: body.status as "TODO" | "DOING" | "DONE" },
  });
  return NextResponse.json({ ok: true });
}

async function addTier(campaignId: string, body: Record<string, unknown>) {
  const name = requiredText(body.name, 80);
  const description = requiredText(body.description, 400);
  const priceUsd = wholeDollars(body.priceUsd);
  if (!name || !description || priceUsd === null) {
    return NextResponse.json(
      { error: "A pledge needs a name, price, and description" },
      { status: 400 }
    );
  }
  const perks =
    typeof body.perks === "string"
      ? body.perks
          .split("\n")
          .map((perk) => perk.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];
  const count = await prisma.tier.count({ where: { campaignId } });
  await prisma.tier.create({
    data: { campaignId, name, description, priceUsd, perks, sortOrder: count },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function deleteTier(campaignId: string, body: Record<string, unknown>) {
  if (typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing pledge" }, { status: 400 });
  }
  try {
    const deleted = await prisma.tier.deleteMany({ where: { id: body.id, campaignId } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "This pledge already has backers, so it stays on the page" },
        { status: 409 }
      );
    }
    throw error;
  }
  return NextResponse.json({ ok: true });
}

async function addFaq(campaignId: string, body: Record<string, unknown>) {
  const question = requiredText(body.question, 200);
  const answer = requiredText(body.answer, 2000);
  if (!question || !answer) {
    return NextResponse.json({ error: "A question and answer are required" }, { status: 400 });
  }
  const count = await prisma.faq.count({ where: { campaignId } });
  await prisma.faq.create({ data: { campaignId, question, answer, sortOrder: count } });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function addSandbox(campaignId: string, body: Record<string, unknown>) {
  const title = requiredText(body.title, 120);
  const sandboxUrl = optionalHttpUrl(body.sandboxUrl);
  const environment = requiredText(body.environment, 80) ?? "Node.js / React";
  if (!title || !sandboxUrl || sandboxUrl === "invalid") {
    return NextResponse.json(
      { error: "A sandbox needs a title and an http or https URL" },
      { status: 400 }
    );
  }
  await prisma.demoSandbox.create({
    data: { campaignId, title, sandboxUrl, environment, status: "RUNNING" },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function addBounty(campaignId: string, body: Record<string, unknown>) {
  const title = requiredText(body.title, 140);
  const description = requiredText(body.description, 2000);
  const rewardUsd = wholeDollars(body.rewardUsd);
  if (!title || !description || rewardUsd === null) {
    return NextResponse.json(
      { error: "A bounty needs a title, description, and reward" },
      { status: 400 }
    );
  }
  await prisma.bounty.create({
    data: { campaignId, title, description, rewardUsd, status: "OPEN" },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function addSponsor(campaignId: string, body: Record<string, unknown>) {
  const sponsorName = requiredText(body.sponsorName, 80);
  const websiteUrl = optionalHttpUrl(body.websiteUrl);
  const tierName = requiredText(body.tierName, 40) ?? "Sponsor";
  const amountPaidUsd = wholeDollars(body.amountPaidUsd);
  if (!sponsorName || !websiteUrl || websiteUrl === "invalid" || amountPaidUsd === null) {
    return NextResponse.json(
      { error: "A sponsor needs a name, website, and amount" },
      { status: 400 }
    );
  }
  await prisma.sponsorSlot.create({
    data: {
      campaignId,
      sponsorName,
      websiteUrl,
      logoUrl: new URL("/favicon.ico", websiteUrl).toString(),
      tierName,
      amountPaidUsd,
      active: true,
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function deleteOwned(
  campaignId: string,
  body: Record<string, unknown>,
  kind: "phase" | "task" | "faq" | "sandbox" | "bounty" | "sponsor"
) {
  if (typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing record" }, { status: 400 });
  }
  const where = { id: body.id, campaignId };
  const deleted =
    kind === "phase"
      ? await prisma.phase.deleteMany({ where })
      : kind === "task"
        ? await prisma.task.deleteMany({ where })
        : kind === "faq"
          ? await prisma.faq.deleteMany({ where })
          : kind === "sandbox"
            ? await prisma.demoSandbox.deleteMany({ where })
            : kind === "bounty"
              ? await prisma.bounty.deleteMany({ where })
              : await prisma.sponsorSlot.deleteMany({ where });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "That record is not on this project" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

async function ownedPhaseId(campaignId: string, value: unknown): Promise<string | null | "invalid"> {
  if (typeof value !== "string" || value.trim() === "") return null;
  const phase = await prisma.phase.findFirst({
    where: { id: value, campaignId },
    select: { id: true },
  });
  return phase ? phase.id : "invalid";
}

function optionalLine(value: unknown, max: number): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim().slice(0, max);
}
