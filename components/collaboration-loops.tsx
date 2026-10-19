"use client";

import { Network, Link as LinkIcon } from "lucide-react";
import type { CollaborationLoopView } from "@/lib/landing-types";

export default function CollaborationLoops({
  collaborations = [],
}: {
  collaborations?: CollaborationLoopView[];
}) {
  if (collaborations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Cross-Project Collaboration Loops</h3>
        </div>
        <span className="font-mono text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
          Cross-Promotional Perks
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {collaborations.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-xs flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-emerald-400" /> {c.partnerTitle}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {c.partnerSubdomain}.crowdventure.quest/{c.partnerSlug}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 rounded-sm bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {c.discountPercentage}% Backer Perk Bundle
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
