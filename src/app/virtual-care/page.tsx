import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import { VirtualCare } from "@/components/neyu/services";

export const metadata: Metadata = { title: "Virtual Care · NEYU Health", description: "Secure video visits with NEYU physicians, prepared by Neyu and connected to your record." };
export default function Page() { return <NeyuPage><VirtualCare /></NeyuPage>; }
