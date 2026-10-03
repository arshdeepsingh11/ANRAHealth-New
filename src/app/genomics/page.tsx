import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import GenomicsPage from "@/components/neyu/pages/Genomics";

export const metadata: Metadata = { title: "Genomics & precision · NEYU Health", description: "Whole-genome and exome sequencing, pharmacogenomics and advanced biomarker testing with BioAro Labs — real prices, reviewed with a NEYU physician." };

export default function Page() {
  return <NeyuPage><GenomicsPage /></NeyuPage>;
}
