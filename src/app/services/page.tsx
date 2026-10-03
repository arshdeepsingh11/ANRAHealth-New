import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import ServicesPage from "@/components/neyu/pages/Services";

export const metadata: Metadata = { title: "Clinic services · NEYU Health", description: "Consultations and onsite diagnostics — echo, stress echo, ECG, Holter, ambulatory BP, carotid ultrasound and myocardial perfusion imaging — plus the CHARM clinic and clinical research." };

export default function Page() {
  return <NeyuPage><ServicesPage /></NeyuPage>;
}
