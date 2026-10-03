import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import SymptomsPage from "@/components/neyu/pages/Symptoms";

export const metadata: Metadata = { title: "Cardiac symptoms · NEYU Health", description: "What chest pain, shortness of breath, palpitations, dizziness, fatigue and swelling can mean, when to call 911, and an AI symptom check with Neyu." };

export default function Page() {
  return <NeyuPage><SymptomsPage /></NeyuPage>;
}
