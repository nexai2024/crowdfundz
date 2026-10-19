import type { Metadata } from "next";
import AbandonedProjectPolicy from "@/components/legal/AbandonedProjectPolicy";

export const metadata: Metadata = {
  title: "Abandoned project policy — CrowdVenture",
  description: "What happens to held milestone funds when a CrowdVenture studio stops shipping, and how to opt into a rescue review.",
};

export default function AbandonedProjectsPage() {
  return <AbandonedProjectPolicy />;
}
