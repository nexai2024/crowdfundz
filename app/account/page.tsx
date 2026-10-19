import Link from "next/link";
import AccountAuthForm from "@/components/account-auth-form";
import CreatorHome from "@/components/creator-home";
import { betaWaitlistEnabled } from "@/lib/beta-gate";
import { getSessionUser } from "@/lib/current-user";
import { getStudioHome } from "@/lib/campaigns";
import { isPlatformAdmin } from "@/lib/platform-admin";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  const creator = user ? await getStudioHome(user.id).catch(() => null) : null;

  const waitlistOnly = betaWaitlistEnabled();

  if (!creator) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 bg-grid-pattern">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-mono text-sm font-bold text-white">
            CROWDVENTURE
          </Link>
          <p className="mt-16 text-xs font-mono uppercase tracking-wider text-emerald-400">Creator home</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold text-white">
            {waitlistOnly
              ? "Sign in to your studio."
              : "Sign in, or create a studio and claim the subdomain with it."}
          </h1>
          {waitlistOnly && (
            <p className="mt-4 max-w-xl text-sm text-slate-400">
              New studios join through the{" "}
              <Link href="/waitlist" className="text-emerald-300 hover:underline">
                beta waitlist
              </Link>
              .
            </p>
          )}
          <AccountAuthForm allowSignUp={!waitlistOnly} />
        </div>
      </main>
    );
  }

  return <CreatorHome creator={creator} signedIn platformAdmin={isPlatformAdmin(user?.email)} />;
}
