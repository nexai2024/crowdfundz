"use client";

import React from "react";
import { Activity, Eye, Users, GitCommit, TrendingUp } from "lucide-react";
import type { BuildMetricView } from "@/lib/landing-types";

export default function AnalyticsDashboard({
  metrics,
}: {
  metrics?: BuildMetricView | null;
}) {
  if (!metrics) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Build-in-Public Analytics</h3>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
          Live Tracking
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <Eye className="h-3.5 w-3.5 text-emerald-400" />
            <span>Page Views</span>
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {metrics.pageViews.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>Unique Visitors</span>
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {metrics.uniqueUsers.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <GitCommit className="h-3.5 w-3.5 text-emerald-400" />
            <span>Git Commits</span>
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {metrics.commitsCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Weekly Growth</span>
          </div>
          <div className="font-mono text-xl font-bold text-emerald-400">
            +{metrics.weeklyGrowth}%
          </div>
        </div>
      </div>
    </div>
  );
}
