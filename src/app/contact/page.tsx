import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import ContactPage from "@/components/neyu/pages/Contact";

export const metadata: Metadata = { title: "Contact · NEYU Health", description: "Two Calgary clinics — North East and Meadow Miles. Hours, phone, fax, a digital map with the nearest clinic, and a message form." };

export default function Page() {
  return <NeyuPage><ContactPage /></NeyuPage>;
}
