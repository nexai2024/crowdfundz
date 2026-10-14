"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { normalizeSubdomain, subdomainError } from "@/lib/subdomain";

export default function AccountAuthForm({
  initialMode = "sign-up",
  redirectTo,
}: {
  initialMode?: "sign-in" | "sign-up";
  redirectTo?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [accountReady, setAccountReady] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const preview = normalizeSubdomain(subdomain).replace(/[^a-z0-9-]/g, "") || "your-name";

  async function claimSubdomain() {
    const response = await fetch("/api/claim-subdomain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subdomain }),
    });
    const data = (await response.json()) as { error?: string; subdomain?: string };
    if (!response.ok || !data.subdomain) {
      setError(data.error || "Account created, but that subdomain was not saved.");
      return false;
    }
    return true;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      if (mode === "sign-up") {
        const invalid = subdomainError(subdomain);
        if (invalid) {
          setError(invalid);
          return;
        }

        if (!accountReady) {
          const result = await authClient.signUp.email({ name, email, password });
          if (result.error) {
            setError(result.error.message || "Could not create that account.");
            return;
          }
          setAccountReady(true);
        }

        const claimed = await claimSubdomain();
        if (!claimed) return;
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message || "Could not sign in.");
          return;
        }
      }

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
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
      className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-white">
        {mode === "sign-up" ? "Create your studio" : "Sign in to your studio"}
      </h2>
      <div className="mt-5 grid gap-4">
        {mode === "sign-up" && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Name
              </span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Subdomain
              </span>
              <input
                required
                value={subdomain}
                onChange={(event) => setSubdomain(event.target.value)}
                placeholder="your-name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <span className="mt-1.5 block font-mono text-[11px] text-slate-500">
                <span className="text-emerald-300">{preview}</span>.crowdventure.quest
              </span>
            </label>
          </>
        )}
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Password
          </span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending
          ? "Working..."
          : mode === "sign-in"
            ? "Sign in"
            : accountReady
              ? "Save subdomain"
              : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
        className="mt-3 w-full text-sm text-slate-400 hover:text-emerald-300"
      >
        {mode === "sign-up" ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
    </form>
  );
}
