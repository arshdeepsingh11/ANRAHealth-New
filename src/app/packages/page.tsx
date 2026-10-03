import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { Packages } from "@/components/neyu/services";

export const metadata: Metadata = { title: "Private Health Packages · NEYU Health", description: "Heart Health Check, Executive Health, Longevity Baseline, Precision Genomics and Metabolic & Hormone packages." };
export default function Page() { return <NeyuPage><Packages /></NeyuPage>; }
