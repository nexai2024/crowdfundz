"use client";

import React from "react";
import { ShieldCheck, FileCheck2, Scale, Lock } from "lucide-react";
import type { ComplianceCheckView } from "@/lib/landing-types";

export default function ComplianceSystem({
  compliance,
}: {
  compliance?: ComplianceCheckView | null;
}) {
  if (!compliance) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Automated Legal Compliance</h3>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <FileCheck2 className="h-3.5 w-3.5" /> Audit Verified
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Non-Equity Shield</div>
          <div className="text-emerald-400 font-bold flex items-center gap-1">
            <Scale className="h-3.5 w-3.5" /> Reward-Based Only
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950">
          <div className="text-slate-500 text-[10px] uppercase mb-1">KYC Status</div>
          <div className="text-white font-bold flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-emerald-400" /> {compliance.kycStatus}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Jurisdiction</div>
          <div className="text-slate-300 font-bold">{compliance.jurisdiction}</div>
        </div>
      </div>
    </div>
  );
}
