import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Share2, ArrowRight, ShieldCheck } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let backer = null;
  if (session_id) {
    backer = await prisma.backer.findUnique({
      where: { stripeSessionId: session_id },
    });
  }

  const backerNumber = backer?.backerNumber || 42;
  const backerName = backer?.name || "Fellow Builder";
  const shareText = encodeURIComponent(
    `I just became Backer #${backerNumber} for Protocol100! Proving that independent creators can build viable software without venture capital. Check the 100-day public sprint:`
  );
  const shareUrl = encodeURIComponent(
    process.env.NEXT_PUBLIC_APP_URL || "https://protocol100.zone"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Official Protocol100 Genesis Backer
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-white mt-4">
          Welcome to the Front Lines, {backerName}.
        </h1>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          Your contribution is verified on the Genesis Ledger. You are officially backer{" "}
          <span className="text-white font-mono font-bold">#{backerNumber}</span>.
        </p>

        {/* Digital Share Card */}
        <div className="my-8 p-6 bg-slate-950/80 border border-slate-800 rounded-2xl text-left relative">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 mb-3 border-b border-slate-900 pb-2">
            <span>GENESIS BADGE</span>
            <span className="text-emerald-400">STATUS: CONFIRMED</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">BACKER #{backerNumber}</div>
          <p className="text-slate-400 text-xs mt-1">
            Proof of work verified. Fueling 100 days of transparent execution.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Permanent placement on Genesis Backer Wall</span>
          </div>
        </div>

        {/* Viral Share Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4" />
            Share Backer Card on X
          </a>
          <Link
            href="/wall"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            View Genesis Wall
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition">
            ← Return to main campaign overview
          </Link>
        </div>
      </div>
    </main>
  );
}