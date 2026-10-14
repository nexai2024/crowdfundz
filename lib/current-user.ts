import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: headers(),
  });
  return session?.user?.id ?? null;
}

export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, subdomain: true },
  });
}
