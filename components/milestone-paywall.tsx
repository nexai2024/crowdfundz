"use client";

import React, { useState } from "react";
import { Lock, Unlock, Key, ArrowUpRight } from "lucide-react";
import type { MilestonePaywallView } from "@/lib/landing-types";

export default function MilestonePaywall({
  totalRaised = 0,
  paywalls = [],
}: {
  totalRaised?: number;
  paywalls?: MilestonePaywallView[];
}) {
  const items: MilestonePaywallView[] = paywalls.length > 0 ? paywalls : [
    {
      id: "pw1",
      title: "Sprint 1 Architecture Specs & DB Schema",
      description: "Full production Prisma schemas and infrastructure blueprint downloads.",
      requiredRaisedUsd: 2000,
      contentUrl: "https://github.com",
      locked: totalRaised < 2000,
    },
    {
      id: "pw2",
      title: "Early Access SDK & Private NPM Package",
      description: "Direct access token to early release candidate packages.",
      requiredRaisedUsd: 5000,
      contentUrl: "https://npmjs.com",
      locked: totalRaised < 5000,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Dynamic Milestone Paywalling</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-full">
          Gated Content Vault
        </span>
      </div>

      <div className="space-y-3">
        {items.map((pw) => (
          <div
            key={pw.id}
            className={`p-4 rounded-xl border font-mono text-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              !pw.locked
                ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                : "border-slate-800 bg-slate-950 text-slate-400"
            }`}
          >
            <div>
              <div className="font-bold flex items-center gap-2 text-sm">
                {!pw.locked ? (
                  <Unlock className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                )}
                <span>{pw.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{pw.description}</p>
              <div className="text-[10px] text-slate-500 mt-2">
                Unlocks at <span className="text-emerald-400">${pw.requiredRaisedUsd.toLocaleString()} raised</span>
              </div>
            </div>

            <div className="shrink-0">
              {!pw.locked ? (
                <a
                  href={pw.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition inline-flex items-center gap-1"
                >
                  Access Content <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-bold">
                  Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
