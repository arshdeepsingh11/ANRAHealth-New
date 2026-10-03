"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Dna, ExternalLink, ArrowRight, X, ChevronRight, Microscope, Users, ShieldCheck } from "lucide-react";
import Assessment from "@/components/lab/assess";
import { BIOARO_TESTS, bioaroBookingUrl, type BioAroTest } from "@/data/bioaroTests";

const TABS = ["Overview", "Available Tests", "Find My Test", "Contact"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_ORDER = [
  "Biological Aging & Healthspan",
  "Genome Sequencing",
  "Microbiome",
  "Vitamin & Nutritional Status",
  "Vascular & Organ Stress",
];

function LabLink() {
  return (
    <Link href="/longevity-lab" className="glass rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 card-hover">
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-gold-600 mb-1">New · NEYU Longevity Lab</span>
        <span className="block text-base font-semibold text-graphite-900">Explore longevity genes, pharmacogenomics and pace of aging — in 3D, with Neyu.</span>
      </span>
      <span className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">Open the Lab <ArrowRight size={14} /></span>
    </Link>
  );
}

function TestModal({ test, onClose }: { test: BioAroTest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(58,70,63,0.55)" }} onClick={onClose}>
      <div className="glass rounded-3xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-gold-600 mb-1">{test.categoryLabel}</p>
            <h3 className="text-xl font-bold text-graphite-900">{test.name}</h3>
          </div>
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700"><X size={20} /></button>
        </div>
        <p className="text-sm text-graphite-600 leading-relaxed mb-2">{test.desc}</p>
        <p className="text-sm font-bold text-gold-700 mb-6">From {test.price}</p>
        <a href={bioaroBookingUrl(test)} target="_blank" rel="noopener noreferrer" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
          Book with BioAro Labs <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

export default function GenomicsPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [openTest, setOpenTest] = useState<BioAroTest | null>(null);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="text-center pt-16 md:pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">NEYU Health — Precision Medicine</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <Dna className="text-gold-500" size={36} />
          Genomics
        </h1>
      </div>

      <div className="flex md:justify-center gap-2 px-6 pb-10 overflow-x-auto md:overflow-visible md:flex-wrap no-scrollbar">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">

        {tab === "Overview" && (
          <div className="space-y-8">
            <div className="glass rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">In Partnership With BioAro Labs</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-4">
                BioAro Labs is a Calgary-based precision health company offering genomic, microbiome, and biomarker testing — from full genome sequencing to gut, hormone, and vascular panels. Results are clinically guided and delivered through secure, encrypted reports.
              </p>
              <p className="text-base leading-relaxed text-graphite-700">
                NEYU Health connects patients to this testing as part of a broader precision medicine approach — combining your genetics, biomarkers, and lifestyle with our physicians' expertise to build a health plan that's actually built around you.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: Microscope, t: "30+ Lab-Grade Tests", d: "From full genome sequencing to targeted microbiome and vascular panels." },
                { icon: Users, t: "Clinically Guided Reports", d: "Context you can actually act on, not just raw numbers." },
                { icon: ShieldCheck, t: "Secure Health Data", d: "Encrypted end-to-end — your genetic information stays yours." },
              ].map((p) => (
                <div key={p.t} className="glass rounded-2xl p-7 text-center card-hover">
                  <p.icon size={26} className="text-gold-500 mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="text-base font-display font-bold text-graphite-900 mb-2">{p.t}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-sm text-graphite-700 mb-5">Not sure which test fits what you're curious about?</p>
              <button onClick={() => setTab("Find My Test")} className="gold-gloss inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold">
                <Sparkles size={14} /> Find My Test
              </button>
            </div>
            <LabLink />
          </div>
        )}

        {tab === "Available Tests" && (
          <div className="space-y-10">
            {CATEGORY_ORDER.map((category) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">{category}</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {BIOARO_TESTS.filter((t) => t.categoryLabel === category).map((t) => (
                    <button key={t.name} onClick={() => setOpenTest(t)} className="glass rounded-2xl p-6 card-hover text-left">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-graphite-900">{t.name}</h3>
                        <span className="text-xs font-bold text-gold-700 shrink-0">{t.price}</span>
                      </div>
                      <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-4">Read more <ChevronRight size={13} /></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-graphite-500 text-center pt-2">More tests are available directly through BioAro Labs — this list will keep growing.</p>
          </div>
        )}

        {tab === "Find My Test" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">AI-guided · about 2 minutes</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-graphite-900">Find the test that fits you</h2>
              <p className="text-sm text-graphite-600 mt-2">Age, sex, family history, medicines and goals — Neyu ranks BioAro Labs tests for you, with real prices. Nothing is stored.</p>
            </div>
            <Assessment kind="genomics" accent="#1D5FA8" />
            <LabLink />
          </div>
        )}

        {tab === "Contact" && (
          <div className="glass rounded-2xl p-7 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">BioAro Labs</p>
            <h3 className="text-xl font-bold text-graphite-900 mb-4">Genomic, Microbiome & Biomarker Testing</h3>
            <p className="text-sm text-graphite-600 leading-relaxed mb-5">
              BioAro Labs operates testing across Canada, with sample collection kits available throughout North America. For booking, pricing, and detailed test information, visit their site directly.
            </p>
            <a href="https://bioarolabs.com" target="_blank" rel="noopener noreferrer" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
              Visit BioAro Labs <ExternalLink size={14} />
            </a>
          </div>
        )}

      </div>

      {openTest && <TestModal test={openTest} onClose={() => setOpenTest(null)} />}
    </div>
  );
}