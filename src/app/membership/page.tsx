import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { Membership } from "@/components/neyu/services";

export const metadata: Metadata = { title: "Membership · NEYU Health", description: "NEYU Membership: connected care all year — Neyu, virtual visits, hypertension clinic, at-home collection and annual assessments." };
export default function Page() { return <NeyuPage><Membership /></NeyuPage>; }
