import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, Heart, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isOnCreatorHost } from "@/lib/hosts";
import { isReservedSubdomain } from "@/lib/subdomain";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { subdomain: string; slug: string };
};

export default async function BackerWallPage({ params }: PageProps) {
  if (isReservedSubdomain(params.subdomain)) notFound();

  const creator = await prisma.user.findUnique({
    where: { subdomain: params.subdomain },
  });
  if (!creator) notFound();

  const campaign = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: creator.id, slug: params.slug } },
    include: {
      backers: {
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 200,
      },
    },
  });
  if (!campaign) notFound();

  const host = headers().get("host") || "";
  const campaignHref = isOnCreatorHost(host, params.subdomain)
    ? `/${params.slug}`
    : `/${params.subdomain}/${params.slug}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href={campaignHref}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {campaign.title}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
              {params.subdomain}/{params.slug}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Backer wall</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{campaign.backers.length} recorded backers</span>
          </div>
        </div>

        {campaign.backers.length === 0 ? (
          <p className="text-sm text-slate-400">No confirmed pledges on this project yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {campaign.backers.map((backer: any) => (
              <div
                key={backer.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 mb-2">
                    <span>#{backer.backerNumber}</span>
                    <span className="text-emerald-400 font-semibold">${backer.amountUsd}</span>
                  </div>
                  <div className="font-semibold text-white truncate">{backer.name}</div>
                  {backer.handle && (
                    <div className="text-xs font-mono text-slate-400 truncate">@{backer.handle}</div>
                  )}
                  {backer.message && (
                    <p className="mt-3 text-xs text-slate-300 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                      &ldquo;{backer.message}&rdquo;
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{backer.createdAt.toLocaleDateString()}</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500/70" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
