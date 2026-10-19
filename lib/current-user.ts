import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("Could not read the session", error);
    return null;
  }
}

export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, subdomain: true },
  });
}
