"use client";

import React, { useState } from "react";
import { Play, Box, ExternalLink, RefreshCw } from "lucide-react";
import type { DemoSandboxView } from "@/lib/landing-types";

export default function DemoSandbox({
  sandboxes = [],
}: {
  sandboxes?: DemoSandboxView[];
}) {
  const [isRunning, setIsRunning] = useState(false);
  const activeSandbox = sandboxes[0];
  if (!activeSandbox) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Backer Demo Sandbox</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full">
          Env: {activeSandbox.environment}
        </span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center relative overflow-hidden">
        {!isRunning ? (
          <div className="py-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
              <Play className="h-6 w-6 fill-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">{activeSandbox.title}</h4>
            <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto">
              Test out the latest build candidate in an isolated cloud sandbox directly from your browser.
            </p>
            <button
              onClick={() => setIsRunning(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition font-mono"
            >
              Launch Interactive Session
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs text-slate-400">
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Container Active: http://localhost:3000
              </span>
              <button
                onClick={() => setIsRunning(false)}
                className="hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Terminate
              </button>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              <div className="text-emerald-400 mb-2">&gt; crowdventure-sandbox --version 1.0.4</div>
              <div>[INFO] Compiling client bundle...</div>
              <div>[INFO] Ready in 142ms. Live preview active.</div>
            </div>
            <a
              href={activeSandbox.sandboxUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 hover:underline"
            >
              Open external container full-screen <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
