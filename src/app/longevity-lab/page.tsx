import LongevityLab from "@/components/lab/LongevityLab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Longevity Lab · NEYU Health",
  description: "Interactive, research-backed explainers on biological aging — intervention responsiveness, GDF-15 and telomeres, pace of aging, pharmacogenomics and longevity genetics — with ALBA, 3D models and BioAro Labs testing.",
};

// Content: src/data/longevityScience.ts · components: src/components/lab/*
export default function LongevityLabPage() {
  return <LongevityLab />;
}
