import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { DiagnosticsHub } from "@/components/neyu/pillars";

export const metadata: Metadata = { title: "Diagnostics · NEYU Health", description: "Diagnostics that connect the dots — lab testing, imaging, monitoring and genomics, explained by Neyu." };
export default function DiagnosticsPage() { return <NeyuPage><DiagnosticsHub /></NeyuPage>; }
