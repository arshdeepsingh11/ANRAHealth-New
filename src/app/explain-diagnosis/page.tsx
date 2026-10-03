import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { ExplainDiagnosis } from "@/components/neyu/pages/AiTools";

export const metadata: Metadata = { title: "Explain My Diagnosis · NEYU Health", description: "Type, attach or scan a diagnosis or doctor's note — Neyu explains what it generally means and what to ask." };

export default function Page() {
  return <NeyuPage><ExplainDiagnosis /></NeyuPage>;
}
