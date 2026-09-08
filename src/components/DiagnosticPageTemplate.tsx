"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowLeft, ChevronDown, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import type { DiagnosticContent } from "@/data/diagnosticContent";
import { STANDARD_TEST_REFERRAL_NOTE } from "@/data/diagnosticContent";

function IconHero({ icon }: { icon: string }) {
  const Icon = (Icons as any)[icon] || Icons.Heart;
  return (
    <div
      className="relative rounded-3xl overflow-hidden flex items-center justify-center h-[140px] md:h-[200px]"
      style={{ background: "linear-gradient(135deg, #6EA8B6 0%, #3F6F7C 100%)" }}
    >
      <Icon size={56} className="text-white" strokeWidth={1.5} />
    </div>
  );
}

function TestCard({ test }: { test: DiagnosticContent["tests"][number] }) {
  const [open, setOpen] = useState(false);
  const Icon = (Icons as any)[test.icon] || Icons.Activity;
  return (
    <div className="glass rounded-2xl overflow-hidden card-hover">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold-50 shrink-0">
          <Icon size={18} className="text-gold-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-graphite-900">{test.name}</h3>
          <p className="flex items-center gap-1.5 text-xs text-gold-700 font-semibold mt-0.5"><Clock size={12} /> {test.duration}</p>
        </div>
        <ChevronDown size={16} className="text-gold-600 shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">How to Prepare</p>
          <ul className="space-y-1.5">
            {test.prep.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-graphite-600 leading-relaxed">
                <CheckCircle2 size={14} className="text-gold-500 mt-0.5 shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DiagnosticPageTemplate({ content }: { content: DiagnosticContent }) {
  const tabs = ["Overview", "What to Expect", "Contact"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="px-5 pt-5 md:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5">
          <ArrowLeft size={15} /> Back to Main Page
        </Link>
      </div>
      <Link href="/" className="hidden md:inline-flex fixed top-5 left-5 z-40 items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-6 md:pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Diagnostics & Testing</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">{content.label}</h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">{content.tagline}</p>
      </div>

      <div className="flex md:justify-center gap-2 px-6 pb-10 overflow-x-auto md:overflow-visible md:flex-wrap no-scrollbar">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        {tab === "Overview" && (
          <div className="space-y-6">
            <IconHero icon={content.icon} />
            <div className="glass rounded-3xl p-6 md:p-10">
              <p className="text-base leading-relaxed text-graphite-700">{content.overview}</p>
            </div>
            <div className="glass rounded-3xl p-6 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">Referral Requirements</p>
              <p className="text-base leading-relaxed text-graphite-700">{content.referralNote || STANDARD_TEST_REFERRAL_NOTE}</p>
            </div>
          </div>
        )}

        {tab === "What to Expect" && (
          <div className="space-y-4">
            {content.tests.map((t) => <TestCard key={t.name} test={t} />)}
          </div>
        )}

        {tab === "Contact" && (
          <div className="glass rounded-2xl p-7 text-center">
            <p className="text-sm text-graphite-600 mb-4">Ready to book this test? Start a referral through our Referral Centre, or ask your physician about ordering it at your next visit.</p>
            <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
              Go to Referral Centre <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}