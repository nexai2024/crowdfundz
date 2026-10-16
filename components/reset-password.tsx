"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token");
  const tokenError = params.get("error");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 bg-grid-pattern">
      <div className="mx-auto max-w-md">
        <Link href="/" className="font-mono text-sm font-bold text-white">
          CROWDVENTURE
        </Link>
        <h1 className="mt-16 text-3xl font-extrabold text-white">
          {token ? "Choose a new password" : "Reset your password"}
        </h1>
        {tokenError && (
          <p className="mt-4 text-sm text-rose-300">That reset link is invalid or expired.</p>
        )}
        {token ? <ChoosePassword token={token} /> : <RequestReset />}
      </div>
    </main>
  );
}

function RequestReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/account/reset",
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "Could not send the reset email.");
      return;
    }
    setMessage("If that account exists, the reset link is on its way.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@studio.dev"
        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white"
      />
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      <button
        disabled={pending}
        className="rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
      >
        {pending ? "Sending..." : "Email me a reset link"}
      </button>
    </form>
  );
}

function ChoosePassword({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "Could not update the password.");
      return;
    }
    setMessage("Password updated. You can sign in.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <input
        required
        type="password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white"
      />
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && (
        <p className="text-sm text-emerald-300">
          {message}{" "}
          <Link href="/account" className="underline">
            Sign in
          </Link>
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
