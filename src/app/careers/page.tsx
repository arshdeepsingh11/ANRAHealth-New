import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import CareersPage from "@/components/neyu/pages/Careers";

export const metadata: Metadata = { title: "Careers · NEYU Health", description: "Join NEYU Health — physicians, sonographers and nurses building connected, AI-assisted care in Calgary." };

export default function Page() {
  return <NeyuPage><CareersPage /></NeyuPage>;
}
