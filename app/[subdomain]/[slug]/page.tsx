import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Users, Zap, Heart } from "lucide-react";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      tiers: { orderBy: { priceUsd: "asc" } },
      backers: {
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!campaign) return notFound();

  const progressPercent = Math.min(
    100,
    Math.round((campaign.totalRaised / campaign.targetGoal) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* SaaS Global Header */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-emerald-400 transition">
          <Zap className="w-4 h-4 text-emerald-500" />
          <span>SOLO-FUND SAAS</span>
        </Link>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Campaign #{campaign.slug}
        </span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Campaign Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {campaign.title}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            {campaign.tagline}
          </p>

          {/* Metrics Bar */}
          <div className="mt-10 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <span className="text-3xl font-extrabold text-white font-mono">
                  ${campaign.totalRaised.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-2">
                  of ${campaign.targetGoal.toLocaleString()} goal
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {campaign.backerCount}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">backers</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Tiers Grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Support This Build</h2>
          <p className="text-sm text-slate-400 text-center mb-8">
            Every micro-pledge fuels independent software without corporate safety nets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaign.tiers.map((tier) => (
              <div
                key={tier.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="font-bold text-white text-lg">{tier.name}</h3>
                    <span className="text-2xl font-extrabold font-mono text-emerald-400">
                      ${tier.priceUsd}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    {tier.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`#checkout-tier-${tier.id}`}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition"
                >
                  Pledge ${tier.priceUsd}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Genesis Backer Wall Preview */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Genesis Backer Wall</h2>
              <p className="text-xs text-slate-400">Live ledger of all verified supporters.</p>
            </div>
            <Link
              href={`/${campaign.slug}/wall`}
              className="text-xs font-mono text-emerald-400 hover:underline"
            >
              View All Backers →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {campaign.backers.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs"
              >
                <div className="flex justify-between text-slate-500 font-mono mb-1">
                  <span>#{b.backerNumber}</span>
                  <span className="text-emerald-400 font-bold">${b.amountUsd}</span>
                </div>
                <div className="font-semibold text-white truncate">{b.name}</div>
                {b.message && (
                  <p className="mt-2 text-slate-300 italic text-[11px]">"{b.message}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}