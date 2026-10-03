import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { MeetNeyuPage } from "@/components/neyu/services";

export const metadata: Metadata = { title: "Meet Neyu · NEYU Health", description: "Neyu, your intelligent health companion — ask questions, understand results, prepare for visits and explore your health." };
export default function Page() { return <NeyuPage><MeetNeyuPage /></NeyuPage>; }
