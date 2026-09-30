import SpecialtyExperience from "@/components/specialty/SpecialtyExperience";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Precision Medicine · NEYU Health" };

// Tabbed, AI-assisted specialty page — content and tools in src/data/specialtyStudio.ts.
export default function PrecisionMedicinePage() {
  return <SpecialtyExperience slug="precision-medicine" />;
}
