import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 10 * 60 * 1000;
const WAITLIST_LIMIT = 5;
const memory = new Map<string, number[]>();
let missingTableLogged = false;

function memoryAllow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (memory.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    memory.set(key, recent);
    return false;
  }
  recent.push(now);
  memory.set(key, recent);
  if (memory.size > 5000) {
    const oldest = memory.keys().next().value;
    if (oldest) memory.delete(oldest);
  }
  return true;
}

export function requestIp(request: Request) {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    const closest = parts[parts.length - 1];
    if (closest) return closest;
  }
  return "unknown";
}

/**
 * Shared limiter for Vercel, where each isolate has its own memory.
 * If the rate-limit table is not migrated yet, production fails closed and
 * development falls back to this process.
 */
export async function consumeRateLimit(scope: string, ip: string, limit: number, windowMs: number) {
  const id = `${scope}:${createHash("sha256").update(`${scope}\0${ip}`).digest("hex")}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const bucket = await prisma.rateLimitBucket.findUnique({ where: { id } });
    if (!bucket || bucket.resetAt.getTime() <= now.getTime()) {
      try {
        await prisma.rateLimitBucket.upsert({
          where: { id },
          create: { id, hits: 1, resetAt },
          update: { hits: 1, resetAt },
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
        await prisma.rateLimitBucket.update({
          where: { id },
          data: { hits: { increment: 1 } },
        });
      }
      if (Math.random() < 0.02) {
        await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } });
      }
      return true;
    }

    if (bucket.hits >= limit) return false;
    const updated = await prisma.rateLimitBucket.updateMany({
      where: { id, hits: { lt: limit }, resetAt: { gt: now } },
      data: { hits: { increment: 1 } },
    });
    if (updated.count === 1) return true;
    const current = await prisma.rateLimitBucket.findUnique({ where: { id } });
    if (!current || current.resetAt.getTime() <= now.getTime()) {
      await prisma.rateLimitBucket.upsert({
        where: { id },
        create: { id, hits: 1, resetAt },
        update: { hits: 1, resetAt },
      });
      return true;
    }
    return current.hits < limit;
  } catch (error) {
    const missing =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022");
    if (missing && !missingTableLogged) {
      missingTableLogged = true;
      console.error("Rate limit table is missing. Run prisma migrate deploy.");
    } else if (!missing) {
      console.error("Rate limit check failed", error instanceof Error ? error.message : error);
    }
    if (missing && process.env.NODE_ENV === "production") return false;
    return memoryAllow(id, limit, windowMs);
  }
}

export function allowWaitlistAttempt(ip: string) {
  return consumeRateLimit("waitlist", ip, WAITLIST_LIMIT, WINDOW_MS);
}
