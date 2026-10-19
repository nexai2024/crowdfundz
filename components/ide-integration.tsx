import { Code2, Terminal } from "lucide-react";
import type { IdeUpdateView } from "@/lib/landing-types";

export default function IdeIntegration({
  initialUpdates = [],
}: {
  initialUpdates?: IdeUpdateView[];
}) {
  if (initialUpdates.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Direct IDE Stream</h3>
        </div>
        <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
          <Code2 className="h-3.5 w-3.5 text-emerald-400" /> Latest commits
        </span>
      </div>

      <div className="space-y-3">
        {initialUpdates.map((update) => (
          <div
            key={update.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 font-mono text-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-bold text-emerald-400">[{update.editor}]</span>
                <span className="truncate">{update.commitMessage}</span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                {update.fileChanged} · Hash: {update.commitHash}
              </div>
            </div>
            <div className="shrink-0 text-right text-[10px]">
              <span className="text-emerald-400">+{update.linesAdded}</span> /{" "}
              <span className="text-rose-400">-{update.linesDeleted}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
