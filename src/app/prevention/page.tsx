import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { PreventionHub } from "@/components/neyu/pillars";

export const metadata: Metadata = { title: "Prevention · NEYU Health", description: "Find risk early and act earlier — AI risk assessment, private health packages and executive health." };
export default function PreventionPage() { return <NeyuPage><PreventionHub /></NeyuPage>; }
