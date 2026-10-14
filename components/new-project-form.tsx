"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectForm({
  subdomain,
  pathPrefix,
  signedIn = false,
}: {
  subdomain: string;
  pathPrefix: string;
  signedIn?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [story, setStory] = useState("");
  const [targetGoal, setTargetGoal] = useState("1000");
  const [tierName, setTierName] = useState("Supporter");
  const [tierPrice, setTierPrice] = useState("10");
  const [tierDescription, setTierDescription] = useState(
    "A one-time pledge for this project."
  );
  const [error, setError] = useState("");
  const [publishedPath, setPublishedPath] = useState("");
  const [pending, setPending] = useState(false);

  const preview = slug.trim().toLowerCase().replace(/\s+/g, "-") || "your-slug";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setPublishedPath("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: subdomain || undefined,
          email: signedIn ? undefined : email,
          slug,
          title,
          tagline,
          story,
          targetGoal: Number(targetGoal),
          tierName,
          tierPrice: Number(tierPrice),
          tierDescription,
        }),
      });
      const data = (await response.json()) as { error?: string; slug?: string };
      if (!response.ok || !data.slug) {
        setError(data.error || "Could not publish that project.");
        return;
      }

      const path = `${pathPrefix}/${data.slug}`;
      setPublishedPath(path);
      setSlug("");
      setTitle("");
      setTagline("");
      setStory("");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      id="publish"
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8"
    >
      <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">New project</p>
      <h2 className="mt-2 text-2xl font-bold text-white">Publish the next slug</h2>
      <p className="mt-2 text-sm text-slate-400">
        {subdomain
          ? signedIn
            ? "This page gets a live campaign at "
            : `Confirm the email that claimed ${subdomain}, then this page gets a live campaign at `
          : "Publish it here first. It stays off the public list until you claim a subdomain. "}
        {subdomain && (
          <span className="font-mono text-emerald-300">
            {subdomain}/{preview}
          </span>
        )}
        {subdomain ? "." : null}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {!signedIn && (
          <Field
            label="Account email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@studio.dev"
            required
            className="sm:col-span-2"
          />
        )}
        <Field label="Title" value={title} onChange={setTitle} placeholder="Harbor" required />
        <Field
          label="Slug"
          value={slug}
          onChange={setSlug}
          placeholder="harbor"
          required
        />
        <Field
          label="Tagline"
          value={tagline}
          onChange={setTagline}
          placeholder="What this build is for"
          required
          className="sm:col-span-2"
        />
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Story
          </span>
          <textarea
            required
            value={story}
            onChange={(event) => setStory(event.target.value)}
            rows={5}
            placeholder="Why this project exists, and what a pledge funds."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <Field
          label="Goal (USD)"
          type="number"
          value={targetGoal}
          onChange={setTargetGoal}
          placeholder="1000"
          required
          min={1}
        />
        <Field
          label="First pledge (USD)"
          type="number"
          value={tierPrice}
          onChange={setTierPrice}
          placeholder="10"
          required
          min={1}
        />
        <Field
          label="Pledge name"
          value={tierName}
          onChange={setTierName}
          placeholder="Supporter"
          required
        />
        <Field
          label="Pledge description"
          value={tierDescription}
          onChange={setTierDescription}
          placeholder="What this pledge includes"
          required
        />
      </div>

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      {publishedPath && (
        <p className="mt-4 text-sm text-emerald-300">
          Published at{" "}
          <a href={publishedPath} className="font-mono underline">
            {subdomain}/{publishedPath.split("/").filter(Boolean).pop()}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending ? "Publishing..." : "Publish project"}
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
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
  min?: number;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type={type}
        required={required}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
      />
    </label>
  );
}
