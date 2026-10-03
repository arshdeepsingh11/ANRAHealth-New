import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { Explore } from "@/components/neyu/services";

export const metadata: Metadata = { title: "Explore all services · NEYU Health", description: "Every NEYU service, tool and program across Care, Diagnostics, Prevention and Longevity." };
export default function Page() { return <NeyuPage><Explore /></NeyuPage>; }
