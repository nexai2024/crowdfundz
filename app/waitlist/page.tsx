import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WaitlistLanding from "@/components/waitlist-landing";
import { betaWaitlistEnabled } from "@/lib/beta-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CrowdVenture — Back Independence",
  description:
    "CrowdVenture is micro-patronage for independent software. Back a public studio, or launch one, without selling equity. The open beta is a waitlist.",
};

export default function WaitlistPage() {
  if (!betaWaitlistEnabled()) redirect("/");

  return <WaitlistLanding />;
}
