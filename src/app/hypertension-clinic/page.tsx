import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { HypertensionClinic } from "@/components/neyu/services";

export const metadata: Metadata = { title: "Virtual Hypertension Clinic · NEYU Health", description: "Manage high blood pressure from home: home readings, Neyu coaching and physician review." };
export default function Page() { return <NeyuPage><HypertensionClinic /></NeyuPage>; }
