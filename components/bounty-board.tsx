"use client";

import { Award, DollarSign } from "lucide-react";
import type { BountyView } from "@/lib/landing-types";

export default function BountyBoard({
  bounties = [],
}: {
  bounties?: BountyView[];
}) {
  if (bounties.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Community Bounty Board</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-full">
          {bounties.length} Bounties Active
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {bounties.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{b.title}</span>
                <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                  {b.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">{b.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-bold text-sm font-mono flex items-center">
                <DollarSign className="h-3.5 w-3.5" />
                {b.rewardUsd}
              </span>
              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-[11px]">
                Claim Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
