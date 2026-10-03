"use client";

// /genomics — precision medicine with BioAro Labs in the NEYU style: genome visual,
// the full BioAro Labs catalog grouped by category with real prices (each links to
// its BioAro page — NEYU never sells or checks out), Neyu's "find my test", and the
// Longevity Lab.
import React, { useMemo, useState } from "react";
import { LAB_TESTS, money } from "@/data/bioaroCatalog";
import Assessment from "@/components/lab/assess";
import { N, Section, PillarHero, LiveChart, CtaBand, IconTile, cardN, gradText, NeyuReads } from "../kit";
import { NIcon } from "../icons";
import { PillNav } from "../fx";

const CAT_ICON: Record<string, string> = { BioGenome: "dna", BioAging: "hourglass", BioHormone: "hormone", BioVascular: "vessel", BioBrain: "brain", BioNutrition: "apple", BioGut: "microbiome", BioSkin: "skin", BioFemme: "user", BioDental: "spark" };

export default function GenomicsPage() {
  const cats = useMemo(() => Array.from(new Set(LAB_TESTS.map((t) => t.cat))).sort((a, b) => (a === "BioGenome" ? -1 : b === "BioGenome" ? 1 : LAB_TESTS.filter((t) => t.cat === b).length - LAB_TESTS.filter((t) => t.cat === a).length)), []);
  const [cat, setCat] = useState(cats[0]);
  const list = LAB_TESTS.filter((t) => t.cat === cat).sort((a, b) => a.price - b.price);
  return (
    <>
      <PillarHero kicker="Diagnostics · Genomics & precision" title={<>Your biology, <span style={gradText}>read precisely.</span></>}
        lead="In partnership with BioAro Labs, a Calgary precision-health company: whole-genome and exome sequencing, pharmacogenomics, aging, hormone, vascular, brain and gut testing — reviewed with a NEYU physician and explained by Neyu."
        page="/genomics" suggestions={["Genome vs exome sequencing — what's the difference?", "What is pharmacogenomics?", "Which test fits my family history?"]}
        stats={[{ v: LAB_TESTS.length, l: "BioAro Labs tests" }, { v: cats.length, l: "categories" }, { v: 30, s: "×", l: "whole-genome read depth (from)" }]}
        visual={<div style={{ ...cardN, padding: 16, display: "grid", gap: 12 }}><LiveChart mode="dna" height={220} /><LiveChart mode="bars" height={170} /></div>} />

      <Section tone="white" label="Catalog" eyebrow="BioAro Labs catalog" title={<>Every test, <span style={gradText}>with real prices.</span></>} lead="Prices as listed by BioAro Labs (CAD). Tap a test to open it on bioarolabs.com — ordering and payment are with BioAro.">
        <PillNav label="Test categories" tabs={cats.map((c) => ({ k: c, label: c.replace("Bio", "Bio "), icon: CAT_ICON[c] || "flask" }))} value={cat} onChange={setCat} />
        <div key={cat} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 14, animation: "fadeUp .3s ease" }}>
          {list.map((t) => (
            <a key={t.id} href={t.url("CA")} target="_blank" rel="noopener" className="sx-card" style={{ ...cardN, padding: 20, display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: N.ink }}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><IconTile icon={CAT_ICON[t.cat] || "flask"} /><b style={{ fontWeight: 500, fontSize: 18, color: N.deep }}>{money(t.price)}</b></span>
              <b style={{ fontWeight: 500, fontSize: 17, lineHeight: 1.3 }}>{t.name}</b>
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: N.ink2 }}>{t.why}</span>
              <span style={{ fontSize: 13, color: N.muted }}>{t.meta}</span>
              <span style={{ marginTop: "auto", fontSize: 13.5, fontWeight: 600, color: N.deep, display: "inline-flex", gap: 6, alignItems: "center" }}>View on BioAro Labs<NIcon name="external" size={15} tone={N.deep} /></span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="find" label="Find my test" eyebrow="Neyu · find my test" title={<>Which test fits <span style={gradText}>your question?</span></>} lead="A few questions about your age, family history, medicines and goals — Neyu ranks the tests that fit, with real prices.">
        <Assessment kind="genomics" />
      </Section>

      <Section tone="white" label="Longevity Lab" eyebrow="New" title={<>The NEYU <span style={gradText}>Longevity Lab.</span></>}>
        <a href="/longevity-lab" className="sx-card" style={{ ...cardN, padding: "clamp(20px,3vw,30px)", display: "flex", gap: 18, alignItems: "center", textDecoration: "none", color: N.ink, flexWrap: "wrap" }}>
          <IconTile icon="hourglass" size={56} active />
          <span style={{ flex: 1, minWidth: 220 }}><b style={{ display: "block", fontWeight: 500, fontSize: 21 }}>Longevity genes, pharmacogenomics and pace of aging — in 3D.</b><span style={{ fontSize: 15, color: N.ink2 }}>Five interactive explainers built from peer-reviewed studies, with Neyu.</span></span>
          <NIcon name="arrow" size={20} tone={N.deep} />
        </a>
        <NeyuReads text="Genetic results are most useful read together with your history, biomarkers and family — that's why every BioAro result can be reviewed with a NEYU physician." />
      </Section>
      <CtaBand title="Questions about a test?" text="Neyu can explain any test in plain language — and a NEYU physician can review your results with you." primary={{ label: "Book a review", href: "/referral-centre" }} secondary={{ label: "Ask Neyu", alba: "Which genetic or biomarker test is right for me?" }} />
    </>
  );
}
