"use client";

import React, { useState } from "react";
import { Code2, Terminal, PlusCircle, Check } from "lucide-react";
import type { IdeUpdateView } from "@/lib/landing-types";

export default function IdeIntegration({
  campaignId,
  initialUpdates = [],
}: {
  campaignId?: string;
  initialUpdates?: IdeUpdateView[];
}) {
  const [updates, setUpdates] = useState<IdeUpdateView[]>(initialUpdates);
  const [commitMsg, setCommitMsg] = useState("");
  const [fileChanged, setFileChanged] = useState("src/app.ts");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (updates.length === 0) return null;

  const handleSimulateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMsg) return;
    setIsSubmitting(true);

    try {
      if (campaignId) {
        const res = await fetch("/api/ide/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId,
            commitMessage: commitMsg,
            fileChanged,
            editor: "VS Code Plugin",
            linesAdded: Math.floor(Math.random() * 50) + 10,
            linesDeleted: Math.floor(Math.random() * 10),
          }),
        });
        const data = await res.json();
        if (data.id) {
          setUpdates([
            {
              id: data.id,
              editor: data.editor,
              commitHash: data.commitHash,
              commitMessage: data.commitMessage,
              linesAdded: data.linesAdded,
              linesDeleted: data.linesDeleted,
              fileChanged: data.fileChanged,
              createdAt: data.createdAt,
            },
            ...updates,
          ]);
        }
      } else {
        setUpdates([
          {
            id: Date.now().toString(),
            editor: "VS Code Extension",
            commitHash: Math.random().toString(36).substring(2, 8),
            commitMessage: commitMsg,
            linesAdded: 28,
            linesDeleted: 4,
            fileChanged,
            createdAt: new Date().toISOString(),
          },
          ...updates,
        ]);
      }
      setCommitMsg("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Direct IDE Stream</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
          <Code2 className="h-3.5 w-3.5 text-emerald-400" /> VS Code / Cursor Plugin Active
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {updates.map((up) => (
          <div
            key={up.id}
            className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs font-mono flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-bold text-emerald-400">[{up.editor}]</span>
                <span className="truncate">{up.commitMessage}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {up.fileChanged} · Hash: {up.commitHash}
              </div>
            </div>
            <div className="shrink-0 text-right text-[10px]">
              <span className="text-emerald-400">+{up.linesAdded}</span> /{" "}
              <span className="text-rose-400">-{up.linesDeleted}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSimulateUpdate} className="flex gap-2">
        <input
          type="text"
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Push update directly from IDE..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={isSubmitting || !commitMsg}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition disabled:opacity-50 flex items-center gap-1 shrink-0"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Push
        </button>
      </form>
    </div>
  );
}
