"use client";

import { Megaphone, ExternalLink } from "lucide-react";
import type { SponsorSlotView } from "@/lib/landing-types";

export default function SponsorSpace({
  sponsors = [],
}: {
  sponsors?: SponsorSlotView[];
}) {
  if (sponsors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Integrated Sponsor Space</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-full">
          Brand Visibility
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {sponsors.map((s) => (
          <a
            key={s.id}
            href={s.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-emerald-500/50 transition font-mono text-xs flex items-center justify-between gap-2"
          >
            <div className="truncate">
              <div className="font-bold text-white truncate">{s.sponsorName}</div>
              <div className="text-[10px] text-emerald-400">{s.tierName}</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
