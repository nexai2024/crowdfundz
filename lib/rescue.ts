import { Prisma, type RescueRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/waitlist-rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RescueError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function allowRescueAttempt(ip: string) {
  return consumeRateLimit("rescue", ip, 5, 10 * 60 * 1000);
}

export async function createRescueOptIn(body: {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  project?: unknown;
  message?: unknown;
  consent?: unknown;
  companyWebsite?: unknown;
}) {
  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return { status: "received" as const };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const project = typeof body.project === "string" ? body.project.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const role = body.role === "backer" || body.role === "maker" ? body.role : null;

  if (name.length < 2 || name.length > 80) {
    throw new RescueError("Enter your full name.", 400);
  }
  if (!EMAIL.test(email) || email.length > 200) {
    throw new RescueError("Enter a valid email address.", 400);
  }
  if (!role) {
    throw new RescueError("Choose backer or maker.", 400);
  }
  if (project.length < 2 || project.length > 160) {
    throw new RescueError("Name the project or paste its page address.", 400);
  }
  if (message.length > 1000) {
    throw new RescueError("Keep the note under 1000 characters.", 400);
  }
  if (body.consent !== true) {
    throw new RescueError("Consent is required to request a rescue review.", 400);
  }

  await prisma.rescueOptIn.create({
    data: {
      name,
      email,
      role: role as RescueRole,
      project,
      message: message || null,
    },
  });

  return { status: "received" as const };
}

export function isRescueSchemaMissing(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022");
}
