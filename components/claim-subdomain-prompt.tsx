"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ClaimSubdomainPrompt({ projectCount }: { projectCount: number }) {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const preview = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "your-name";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/claim-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain }),
      });
      const data = (await response.json()) as { error?: string; subdomain?: string };
      if (!response.ok || !data.subdomain) {
        setError(data.error || "Could not claim that subdomain.");
        return;
      }

      const { protocol, hostname, port } = window.location;
      const root = hostname.endsWith(".localhost") || hostname === "localhost"
        ? "localhost"
        : hostname.split(".").slice(-2).join(".");
      window.location.href = `${protocol}//${data.subdomain}.${root}${port ? `:${port}` : ""}`;
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 sm:p-8"
    >
      <p className="text-xs font-mono uppercase tracking-wider text-emerald-300">Claim your subdomain</p>
      <h2 className="mt-2 text-2xl font-bold text-white">
        {projectCount === 1 ? "This project is hidden from the platform list." : `These ${projectCount} projects are hidden from the platform list.`}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">
        Claim a name and they show up as{" "}
        <span className="font-mono text-emerald-300">{preview}/your-slug</span>.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="block flex-1">
          <span className="sr-only">Subdomain</span>
          <input
            required
            value={subdomain}
            onChange={(event) => setSubdomain(event.target.value)}
            placeholder="your-name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? "Claiming..." : "Claim your subdomain"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </form>
  );
}
