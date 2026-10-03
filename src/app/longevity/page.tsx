import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { LongevityHub } from "@/components/neyu/pillars";

// Longevity pillar: Assess → Understand → Personalize → Improve. The healthy-aging
// assessment, Longevity Lab, Nutrition Starter Plan and longevity score live here.
export const metadata: Metadata = { title: "Longevity · NEYU Health", description: "Move from healthcare to healthspan — assess, understand, personalize and improve, with Neyu." };
export default function LongevityPage() { return <NeyuPage><LongevityHub /></NeyuPage>; }
