import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import PhysiciansPage from "@/components/neyu/pages/Physicians";

export const metadata: Metadata = { title: "Physicians · NEYU Health", description: "Meet the NEYU physicians — cardiology, internal medicine, endocrinology, pediatrics and rheumatology — with the languages each one speaks and an AI physician matcher." };

export default function Page() {
  return <NeyuPage><PhysiciansPage /></NeyuPage>;
}
