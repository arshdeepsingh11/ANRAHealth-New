import SpecialtyExperience from "@/components/specialty/SpecialtyExperience";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Respiratory Medicine · ANRA Health" };

// Tabbed, AI-assisted specialty page — content and tools in src/data/specialtyStudio.ts.
export default function RespiratoryMedicinePage() {
  return <SpecialtyExperience slug="respiratory-medicine" />;
}
