import Link from "next/link";
import AccountAuthForm from "@/components/account-auth-form";
import CreatorHome from "@/components/creator-home";
import { getSessionUserId } from "@/lib/current-user";
import { getStudioHome } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getSessionUserId();
  const creator = userId ? await getStudioHome(userId).catch(() => null) : null;

  if (!creator) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 bg-grid-pattern">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-mono text-sm font-bold text-white">
            CROWDVENTURE
          </Link>
          <p className="mt-16 text-xs font-mono uppercase tracking-wider text-emerald-400">Creator home</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold text-white">
            Sign in, or create a studio and claim the subdomain with it.
          </h1>
          <AccountAuthForm />
        </div>
      </main>
    );
  }

  return <CreatorHome creator={creator} signedIn />;
}
