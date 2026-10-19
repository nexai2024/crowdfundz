import type { Metadata } from "next";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy policy — CrowdVenture",
  description: "What CrowdVenture stores for accounts, pledges, the waitlist, and project rescue requests.",
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
