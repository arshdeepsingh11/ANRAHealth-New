import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import SpecialtiesPage from "@/components/neyu/pages/Specialties";

export const metadata: Metadata = { title: "Specialties · NEYU Health", description: "Cardiology, heart failure, internal medicine, endocrinology, geriatric medicine and pediatric rheumatology, with partner care for breathing, sleep, nutrition and skin — connected by Neyu." };

export default function Page() {
  return <NeyuPage><SpecialtiesPage /></NeyuPage>;
}
