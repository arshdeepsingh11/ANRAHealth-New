import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import ResourcesPage from "@/components/neyu/pages/Resources";

export const metadata: Metadata = { title: "Patient resources · NEYU Health", description: "Test preparation, a condition library, new-patient information and AI tools — Referral Centre, Lab Result Explainer and Explain My Diagnosis." };

export default function Page() {
  return <NeyuPage><ResourcesPage /></NeyuPage>;
}
