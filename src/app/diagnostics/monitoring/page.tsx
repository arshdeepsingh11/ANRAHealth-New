import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import DiagnosticPage from "@/components/neyu/pages/Diagnostic";

export const metadata: Metadata = { title: "Monitoring · NEYU Health" };

export default function Page() {
  return <NeyuPage><DiagnosticPage slug="monitoring" /></NeyuPage>;
}
