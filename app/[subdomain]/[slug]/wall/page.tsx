import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, ArrowLeft, Heart } from "lucide-react";

export const revalidate = 60; // Refresh cache every 60 seconds

export default async function GenesisWallPage() {
  const backers = await prisma.backer.findMany({
    where: { status: "SUCCEEDED" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaign
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
              Public Ledger of Independence
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              The Genesis Backer Wall
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{backers.length} Recorded Backers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {backers.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-500 mb-2">
                  <span>#{b.backerNumber}</span>
                  <span className="text-emerald-400 font-semibold">${b.amountUsd}</span>
                </div>
                <div className="font-semibold text-white truncate">{b.name}</div>
                {b.handle && (
                  <div className="text-xs font-mono text-slate-400 truncate">@{b.handle}</div>
                )}
                {b.message && (
                  <p className="mt-3 text-xs text-slate-300 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                    "{b.message}"
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                <Heart className="w-3.5 h-3.5 text-rose-500/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}