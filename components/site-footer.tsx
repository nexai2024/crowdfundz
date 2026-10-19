import type { ReactNode } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { OptInRescueModal } from "@/components/dashboard/OptInRescueModal";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Zap className="h-4 w-4" fill="currentColor" />
            </span>
            CROWDVENTURE
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Back independence. Fund the build you can see.
          </p>
        </div>

        <FooterColumn title="Platform">
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/community">Community</FooterLink>
          <FooterLink href="/waitlist">Join the waitlist</FooterLink>
          <FooterLink href="/account">Sign in</FooterLink>
          <FooterLink href="/waitlist#model">How a pledge works</FooterLink>
        </FooterColumn>

        <FooterColumn title="Policies">
          <FooterLink href="/legal/privacy">Privacy policy</FooterLink>
          <FooterLink href="/legal/terms">Terms of service</FooterLink>
          <FooterLink href="/legal/abandoned-projects">Abandoned projects</FooterLink>
          <OptInRescueModal />
        </FooterColumn>

        <FooterColumn title="Studios">
          <FooterLink href="/account">Your studio</FooterLink>
          <FooterLink href="/waitlist#builders">For builders</FooterLink>
          <FooterLink href="/waitlist#patrons">For patrons</FooterLink>
          <FooterLink href="/waitlist#join">Write the founder</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-slate-900">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs leading-relaxed text-slate-500">
          CrowdVenture facilitates micro-patronage and reward-based project backing. Contributions made on this
          platform are fees for access, digital perks, early software versions, or creator sponsorship. CrowdVenture
          is not an equity crowdfunding portal, broker-dealer, or registered investment advisor. Backing a creator
          does not confer equity, ownership, voting rights, or a monetary return. Contributions are non-charitable and
          not tax-deductible.
        </p>
        <p className="mx-auto max-w-6xl px-6 pb-8 font-mono text-xs text-slate-600">© {new Date().getFullYear()} CrowdVenture</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav className="flex flex-col items-start gap-3" aria-label={title}>
      <p className="font-mono text-xs uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm text-slate-400 transition hover:text-emerald-300">
      {children}
    </Link>
  );
}
