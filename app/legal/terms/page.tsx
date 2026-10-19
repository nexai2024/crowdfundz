import type { Metadata } from "next";
import TermsOfService from "@/components/legal/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of service — CrowdVenture",
  description: "What a CrowdVenture pledge is, how the money moves, and what makers and patrons agree to.",
};

export default function TermsPage() {
  return <TermsOfService />;
}
