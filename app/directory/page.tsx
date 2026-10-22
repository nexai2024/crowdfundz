import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { headers } from "next/headers";
import { isOnCreatorHost } from "@/lib/hosts";

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const host = (await headers()).get("host") || "localhost:3000";
  const params = await searchParams;
  const sort = params.sort || "newest";

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "ending") {
    orderBy = { endsAt: "asc" };
  } else if (sort === "progress") {
    orderBy = { totalRaised: "desc" };
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      ...(sort === "ending" ? { endsAt: { not: null, gt: new Date() } } : {})
    },
    orderBy,
    include: { creator: true },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Active Campaigns</h1>

        <div className="flex gap-4 mb-8">
          <Link href="/directory?sort=newest" className={`px-4 py-2 rounded-lg text-sm font-bold transition ${sort === 'newest' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}>Newest</Link>
          <Link href="/directory?sort=progress" className={`px-4 py-2 rounded-lg text-sm font-bold transition ${sort === 'progress' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}>Goal Progress</Link>
          <Link href="/directory?sort=ending" className={`px-4 py-2 rounded-lg text-sm font-bold transition ${sort === 'ending' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}>Ending Soon</Link>
        </div>

        <div className="grid gap-6">
          {campaigns.map(c => {
            const onCreatorHost = isOnCreatorHost(host, c.creator.subdomain || "");
            const href = onCreatorHost ? `/${c.slug}` : `/${c.creator.subdomain}/${c.slug}`;
            const progress = Math.min(100, Math.round((c.totalRaised / Math.max(c.targetGoal, 1)) * 100));

            return (
              <Link key={c.id} href={href} className="block p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{c.title}</h2>
                    <p className="text-slate-400 text-sm">{c.tagline}</p>
                  </div>
                  {c.endsAt && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      Ends: {c.endsAt.toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>${c.totalRaised.toLocaleString()} raised</span>
                  <span>{progress}% of ${c.targetGoal.toLocaleString()}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
