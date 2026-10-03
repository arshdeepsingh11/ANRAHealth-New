import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { AtHome } from "@/components/neyu/services";

export const metadata: Metadata = { title: "At-home Blood Collection · NEYU Health", description: "A trained collector comes to you; results flow into your NEYU record and Neyu explains them." };
export default function Page() { return <NeyuPage><AtHome /></NeyuPage>; }
