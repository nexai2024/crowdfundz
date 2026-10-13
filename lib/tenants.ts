import { prisma } from "./prisma";

export async function getTenantBySubdomain(subdomain: string) {
  return prisma.user.findUnique({
    where: { subdomain },
  });
}

export async function getAllTenants() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}
