import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowRight, CheckCircle2, Share2, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isOnCreatorHost } from "@/lib/hosts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { subdomain: string; slug: string };
  searchParams: { session_id?: string };
};

export default async function SuccessPage({ params, searchParams }: PageProps) {
  const creator = await prisma.user.findUnique({
    where: { subdomain: params.subdomain },
  });
  if (!creator) notFound();

  const campaign = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: creator.id, slug: params.slug } },
  });
  if (!campaign) notFound();

  const backer = searchParams.session_id
    ? await prisma.backer.findUnique({
        where: { stripeSessionId: searchParams.session_id },
      })
    : null;

  const backerNumber = backer?.backerNumber;
  const backerName = backer?.name || "Fellow builder";
  const host = headers().get("host") || "";
  const onCreatorHost = isOnCreatorHost(host, params.subdomain);
  const campaignHref = onCreatorHost ? `/${params.slug}` : `/${params.subdomain}/${params.slug}`;
  const wallHref = `${campaignHref}/wall`;
  const shareText = encodeURIComponent(
    `I just backed ${campaign.title}. ${campaign.tagline}`
  );
  const shareUrl = encodeURIComponent(
    onCreatorHost
      ? `https://${params.subdomain}.${host.split(".").slice(-2).join(".")}/${params.slug}`
      : campaignHref
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          {campaign.title}
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-white mt-4">
          You are on the wall, {backerName}.
        </h1>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          {backerNumber
            ? `You are backer #${backerNumber} on ${params.subdomain}/${params.slug}.`
            : `Your pledge for ${campaign.title} is recorded.`}
        </p>

        <div className="my-8 p-6 bg-slate-950/80 border border-slate-800 rounded-2xl text-left relative">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 mb-3 border-b border-slate-900 pb-2">
            <span>BACKER BADGE</span>
            <span className="text-emerald-400">STATUS: CONFIRMED</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {backerNumber ? `BACKER #${backerNumber}` : campaign.title}
          </div>
          <p className="text-slate-400 text-xs mt-1">{campaign.tagline}</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Placement on this project&apos;s backer wall</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4" />
            Share on X
          </a>
          <Link
            href={wallHref}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            View backer wall
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-6">
          <Link href={campaignHref} className="text-xs text-slate-500 hover:text-slate-400 transition">
            ← Return to {campaign.title}
          </Link>
        </div>
      </div>
    </main>
  );
}
