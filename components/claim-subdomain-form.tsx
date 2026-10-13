"use client";

import { useState, type FormEvent } from "react";

export default function ClaimSubdomainForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [headline, setHeadline] = useState("");
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");
  const [pending, setPending] = useState(false);

  const preview = (subdomain || "your-name").toLowerCase().replace(/[^a-z0-9-]/g, "");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setCreatedUrl("");

    try {
      const response = await fetch("/api/create-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subdomain, headline }),
      });
      const data = (await response.json()) as { error?: string; subdomain?: string };
      if (!response.ok || !data.subdomain) {
        setError(data.error || "Could not claim that subdomain.");
        return;
      }

      const { protocol, hostname, port } = window.location;
      const root = hostname.endsWith(".localhost")
        ? "localhost"
        : hostname === "localhost"
          ? "localhost"
          : hostname.split(".").slice(-2).join(".");
      setCreatedUrl(`${protocol}//${data.subdomain}.${root}${port ? `:${port}` : ""}`);
      setName("");
      setEmail("");
      setSubdomain("");
      setHeadline("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-300">
        <span className="text-emerald-400">{preview || "your-name"}</span>
        <span className="text-slate-500">.crowdventure.quest</span>
        <span className="text-white">/your-project</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" value={name} onChange={setName} placeholder="Alex Morgan" required />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="alex@studio.dev"
          required
        />
        <Field
          label="Subdomain"
          value={subdomain}
          onChange={setSubdomain}
          placeholder="alex"
          required
          className="sm:col-span-2"
        />
        <Field
          label="Headline"
          value={headline}
          onChange={setHeadline}
          placeholder="Shipping in public, one project at a time"
          className="sm:col-span-2"
        />
      </div>

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      {createdUrl && (
        <p className="mt-4 text-sm text-emerald-300">
          Your page is ready at{" "}
          <a href={createdUrl} className="underline font-mono">
            {createdUrl}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
      >
        {pending ? "Claiming..." : "Claim this subdomain"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
      />
    </label>
  );
}
