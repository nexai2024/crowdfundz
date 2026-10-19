import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import type { WaitlistStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { betaWaitlistEnabled } from "@/lib/beta-gate";
import { sendTransactionalEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = ["pending", "approved", "rejected", "promoted"] as const;

export type WaitlistStatusName = (typeof STATUSES)[number];

export class WaitlistError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
  }
}

export function normalizeWaitlistEmail(value: string) {
  return value.trim().toLowerCase();
}

export function parseWaitlistSubmission(input: {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  consent?: unknown;
  companyWebsite?: unknown;
  source?: unknown;
}) {
  if (typeof input.companyWebsite === "string" && input.companyWebsite.trim()) {
    return { honeypot: true as const };
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? normalizeWaitlistEmail(input.email) : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const source = typeof input.source === "string" && input.source.trim() ? input.source.trim().slice(0, 80) : "waitlist";

  if (name.length < 2 || name.length > 80) {
    throw new WaitlistError("Enter your full name.", 400, "invalid_name");
  }
  if (!EMAIL.test(email) || email.length > 200) {
    throw new WaitlistError("Enter a valid email address.", 400, "invalid_email");
  }
  if (message.length > 1000) {
    throw new WaitlistError("Keep the note under 1000 characters.", 400, "invalid_message");
  }
  if (input.consent !== true) {
    throw new WaitlistError("Consent is required to join the beta list.", 400, "consent_required");
  }

  return {
    honeypot: false as const,
    name,
    email,
    message: message || null,
    source,
  };
}

export function isWaitlistStatus(value: string): value is WaitlistStatusName {
  return (STATUSES as readonly string[]).includes(value);
}

async function deliverEmail(mail: { to: string; subject: string; text: string }) {
  try {
    await sendTransactionalEmail(mail);
  } catch (error) {
    const unconfigured = error instanceof Error && error.message === "Email delivery is not configured";
    if (process.env.NODE_ENV === "production" || !unconfigured) throw error;
    console.info(`Email delivery is not configured. Not sent to ${mail.to}: ${mail.subject}`);
  }
}

async function notifyTeam(entry: { name: string; email: string; message: string | null; source: string }) {
  if (!betaWaitlistEnabled()) return;
  const to = process.env.WAITLIST_NOTIFY_EMAIL || process.env.PLATFORM_ADMIN_EMAILS?.split(",")[0]?.trim();
  if (!to) return;
  await deliverEmail({
    to,
    subject: "New CrowdVenture beta waitlist entry",
    text: `${entry.name} (${entry.email}) joined the beta waitlist.\nSource: ${entry.source}\n\n${entry.message || "(no message)"}`,
  });
}

export async function joinWaitlist(input: {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  consent?: unknown;
  companyWebsite?: unknown;
  source?: unknown;
}) {
  const parsed = parseWaitlistSubmission(input);
  if (parsed.honeypot) return { status: "joined" as const };

  try {
    const entry = await prisma.waitlistEntry.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        message: parsed.message,
        source: parsed.source,
      },
    });

    try {
      await deliverEmail({
        to: entry.email,
        subject: "You're on the CrowdVenture beta list",
        text: `Thanks ${entry.name}. You're on the list for the CrowdVenture open beta.\n\nWe'll email this address when a studio spot opens. You don't need to do anything else.`,
      });
    } catch (error) {
      await prisma.waitlistEntry.delete({ where: { id: entry.id } });
      throw error;
    }

    try {
      await notifyTeam(entry);
    } catch (error) {
      console.error("Waitlist team notice failed", error);
    }

    return { status: "joined" as const };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new WaitlistError("You're already on the list.", 409, "already_listed");
    }
    throw error;
  }
}

async function setStatus(id: string, from: WaitlistStatus[], status: WaitlistStatus) {
  const result = await prisma.waitlistEntry.updateMany({
    where: { id, status: { in: from } },
    data: { status, statusChangedAt: new Date() },
  });
  if (result.count !== 1) {
    throw new WaitlistError("That entry can't be moved to this status.", 409, "invalid_transition");
  }
}

export async function reviewWaitlistEntry(id: string, action: "approve" | "reject") {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) throw new WaitlistError("That waitlist entry was not found.", 404, "not_found");
  if (entry.status === "promoted") {
    throw new WaitlistError("Promoted entries stay on the list for audit.", 409, "invalid_transition");
  }
  await setStatus(id, ["pending", "approved", "rejected"], action === "approve" ? "approved" : "rejected");
  return prisma.waitlistEntry.findUniqueOrThrow({ where: { id } });
}

function authBaseUrl() {
  const value = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  return value.replace(/\/$/, "");
}

export async function promoteWaitlistEntry(id: string) {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) throw new WaitlistError("That waitlist entry was not found.", 404, "not_found");
  if (entry.status !== "approved") {
    throw new WaitlistError("Approve the entry before promoting it.", 409, "not_approved");
  }

  const existing = await prisma.user.findUnique({ where: { email: entry.email } });
  if (existing) {
    throw new WaitlistError("An account with that email already exists.", 409, "user_exists");
  }

  await setStatus(id, ["approved"], "promoted");

  let userId: string | null = null;
  try {
    const password = `${randomBytes(24).toString("base64url")}Aa1!`;
    const created = await auth.api.signUpEmail({
      body: { name: entry.name, email: entry.email, password },
    });
    userId = created.user.id;

    const token = randomBytes(18).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.verification.create({
      data: {
        identifier: `reset-password:${token}`,
        value: userId,
        expiresAt,
      },
    });
    const callbackURL = encodeURIComponent("/account/reset");
    const inviteUrl = `${authBaseUrl()}/api/auth/reset-password/${token}?callbackURL=${callbackURL}`;

    await deliverEmail({
      to: entry.email,
      subject: "Your CrowdVenture studio invite",
      text: `${entry.name}, your beta spot is open.\n\nSet a password to enter your studio. This link expires in one hour:\n\n${inviteUrl}\n\nAfter that, sign in at ${authBaseUrl()}/account.`,
    });
  } catch (error) {
    await prisma.waitlistEntry.update({
      where: { id },
      data: { status: "approved", statusChangedAt: new Date() },
    });
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    throw error;
  }

  return prisma.waitlistEntry.findUniqueOrThrow({ where: { id } });
}

export async function listWaitlist(query: { q?: string; status?: string }) {
  const q = query.q?.trim();
  const status = query.status && isWaitlistStatus(query.status) ? query.status : undefined;
  const where: Prisma.WaitlistEntryWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [entries, grouped] = await Promise.all([
    prisma.waitlistEntry.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.waitlistEntry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts: Record<WaitlistStatusName, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    promoted: 0,
  };
  for (const row of grouped) counts[row.status] = row._count._all;

  return { entries, counts };
}
