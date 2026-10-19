"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";

type Role = "backer" | "maker";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OptInRescueModal({
  label = "Opt in to project rescue",
  className = "text-left text-sm text-slate-400 transition hover:text-emerald-300",
}: {
  label?: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("backer");
  const [project, setProject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function open() {
    setDone(false);
    setError("");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function onBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedProject = project.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Enter your full name.");
      return;
    }
    if (!EMAIL.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (trimmedProject.length < 2 || trimmedProject.length > 160) {
      setError("Name the project or paste its page address.");
      return;
    }
    if (message.trim().length > 1000) {
      setError("Keep the note under 1000 characters.");
      return;
    }
    if (!consent) {
      setError("Consent is required to request a rescue review.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: normalizedEmail,
          role,
          project: trimmedProject,
          message: message.trim(),
          consent,
          companyWebsite,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not save that request.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={open} className={className}>
        {label}
      </button>
      <dialog
        ref={dialogRef}
        onClick={onBackdrop}
        className="fixed top-1/2 left-1/2 max-h-[90vh] w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-0 text-slate-100 shadow-2xl backdrop:bg-black/75"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Rescue</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Ask for a project review</h2>
            </div>
            <button type="button" onClick={close} className="text-sm text-slate-400 hover:text-white" aria-label="Close">
              Close
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Held milestone funds stay on the platform until a phase ships. This request asks for a review. It does not
            refund money or hand over the studio by itself.
          </p>

          {done ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="font-semibold text-white">You&apos;re on the rescue list.</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                We&apos;ll use {email.trim().toLowerCase()} if that project needs a decision.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-white outline-hidden focus:border-emerald-500/60"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-white outline-hidden focus:border-emerald-500/60"
                />
              </label>
              <fieldset>
                <legend className="text-sm text-slate-300">Your role</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <RoleChoice
                    name="rescue-role"
                    value="backer"
                    current={role}
                    onChange={setRole}
                    title="Backer"
                    detail="Review held funds"
                  />
                  <RoleChoice
                    name="rescue-role"
                    value="maker"
                    current={role}
                    onChange={setRole}
                    title="Maker"
                    detail="Continue the build"
                  />
                </div>
              </fieldset>
              <label className="block text-sm text-slate-300">
                Project
                <input
                  value={project}
                  onChange={(event) => setProject(event.target.value)}
                  required
                  placeholder="Project name or page address"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-white outline-hidden placeholder:text-slate-600 focus:border-emerald-500/60"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Note (optional)
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-white outline-hidden focus:border-emerald-500/60"
                />
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1"
                />
                <span>I agree to be contacted about this rescue request at this email address.</span>
              </label>
              <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                Company website
                <input
                  value={companyWebsite}
                  onChange={(event) => setCompanyWebsite(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {pending ? "Sending…" : "Request a review"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

function RoleChoice({
  name,
  value,
  current,
  onChange,
  title,
  detail,
}: {
  name: string;
  value: Role;
  current: Role;
  onChange: (value: Role) => void;
  title: string;
  detail: string;
}) {
  const selected = current === value;
  return (
    <label
      className={`cursor-pointer rounded-xl border px-3 py-2 ${
        selected ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-800 bg-slate-900"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className="block text-sm font-semibold text-white">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-400">{detail}</span>
    </label>
  );
}
