import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { LabResults } from "@/components/neyu/pages/AiTools";

export const metadata: Metadata = { title: "Lab Result Explainer · NEYU Health", description: "Paste your lab values or scan a report — Neyu explains each result in plain language." };

export default function Page() {
  return <NeyuPage><LabResults /></NeyuPage>;
}
