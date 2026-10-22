import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/current-user";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { prisma } from "@/lib/prisma";
import RescueAdmin from "@/components/rescue-admin";

export const dynamic = "force-dynamic";

export default async function RescueAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/account");
  if (!isPlatformAdmin(user.email)) notFound();

  const rescues = await prisma.rescueOptIn.findMany({
    orderBy: { createdAt: "desc" }
  });

  const enrichedRescues = await Promise.all(rescues.map(async (rescue) => {
    let allocations: { id: string; amountUsd: number; status: string; phase: { title: string; pullRequestMergedAt: Date | null } }[] = [];
    if (rescue.role === "backer") {
      allocations = await prisma.pledgeAllocation.findMany({
        where: {
          backer: { email: { equals: rescue.email, mode: "insensitive" } },
          status: "HELD"
        },
        include: { phase: true }
      });
    }
    return { ...rescue, allocations };
  }));

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Platform Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Rescue Queue</h1>
        </div>

        <RescueAdmin rescues={enrichedRescues} />
      </div>
    </main>
  );
}
