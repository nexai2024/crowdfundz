import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { isOnCreatorHost } from "@/lib/hosts";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PatronHome() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/account");
  }

  const host = (await headers()).get("host") || "localhost:3000";

  const pledges = await prisma.backer.findMany({
    where: { email: { equals: user.email, mode: "insensitive" } },
    include: {
      campaign: { include: { creator: true } },
      tier: true,
      allocations: { include: { phase: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  const rooms = await prisma.communityMembership.findMany({
    where: { userId: user.id },
    include: {
      subcommunity: { include: { community: true, campaign: { include: { creator: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Patron Dashboard</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Your Pledges</h2>
            {pledges.length === 0 ? (
              <p className="text-slate-500 text-sm">You haven&apos;t backed any projects yet.</p>
            ) : (
              <div className="space-y-4">
                {pledges.map((pledge) => {
                  const onCreatorHost = isOnCreatorHost(host, pledge.campaign.creator.subdomain || "");
                  const campaignHref = onCreatorHost ? `/${pledge.campaign.slug}` : `/${pledge.campaign.creator.subdomain}/${pledge.campaign.slug}`;

                  return (
                    <div key={pledge.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/60">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link href={campaignHref} className="font-bold text-white hover:text-emerald-400 transition">
                            {pledge.campaign.title}
                          </Link>
                          <div className="text-xs text-slate-500">{pledge.tier.name} · \${pledge.amountUsd}</div>
                          {pledge.status === 'SUCCEEDED' && (
                            <div className="mt-1 text-[10px] text-slate-400">
                              Receipt sent via email
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${pledge.status === 'SUCCEEDED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {pledge.status}
                        </span>
                      </div>

                      {pledge.fundingMode === "MILESTONE" && pledge.allocations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2">
                          <h4 className="text-[10px] font-mono text-slate-500 uppercase">Milestones</h4>
                          {pledge.allocations.map(alloc => (
                            <div key={alloc.id} className="flex justify-between items-center text-xs">
                              <span className="text-slate-300">{alloc.phase.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500">\${alloc.amountUsd}</span>
                                {alloc.status === "HELD" && alloc.phase.pullRequestMergedAt && (
                                  <Link href={campaignHref} className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition text-[10px]">
                                    Sign Off
                                  </Link>
                                )}
                                {alloc.status !== "HELD" && (
                                  <span className="text-slate-600">{alloc.status}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Your Communities</h2>
            {rooms.length === 0 ? (
              <p className="text-slate-500 text-sm">You haven&apos;t joined any rooms.</p>
            ) : (
              <div className="space-y-4">
                {rooms.map((membership) => {
                  const subcommunity = membership.subcommunity;
                  const onCreatorHost = isOnCreatorHost(host, subcommunity.campaign.creator.subdomain || "");
                  const roomHref = onCreatorHost ? `/community/${subcommunity.community.slug}` : `/community/${subcommunity.campaign.creator.subdomain}/${subcommunity.community.slug}`;

                  return (
                    <Link key={membership.id} href={roomHref} className="block p-4 border border-slate-800 rounded-xl bg-slate-900/60 hover:border-emerald-500/50 transition">
                      <h3 className="font-bold text-white mb-1">{subcommunity.community.name}</h3>
                      <p className="text-xs text-slate-400">For backers of {subcommunity.campaign.title}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
