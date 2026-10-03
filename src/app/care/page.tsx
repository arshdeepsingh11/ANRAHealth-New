import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { CareHub } from "@/components/neyu/pillars";

export const metadata: Metadata = { title: "Care · NEYU Health", description: "Connected care around you — specialists, virtual care, the Virtual Hypertension Clinic and referrals, guided by Neyu." };
export default function CarePage() { return <NeyuPage><CareHub /></NeyuPage>; }
