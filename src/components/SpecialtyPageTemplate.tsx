"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowLeft, ChevronRight, MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";
import { physicians, Physician } from "@/data/physicians";
import { locations, brand } from "@/data/content";
import type { SpecialtyContent } from "@/data/specialtyContent";

const STANDARD_REFERRAL_NOTE =
  "A referral from your family physician is typically required. Please bring your Alberta Health Card, photo ID, and a current medication list to your first appointment.";

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

function PhysicianCard({ p }: { p: Physician }) {
  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <h3 className="text-lg font-bold text-graphite-900 mb-1">{p.name}</h3>
      <p className="text-xs font-semibold text-gold-600 mb-3">{p.title}</p>
      <p className="text-sm text-graphite-600 mb-4 leading-relaxed line-clamp-3">{p.bio}</p>
      <div className="space-y-1.5 text-xs text-graphite-500 border-t border-pearl-200 pt-3">
        <p className="flex items-center gap-2"><MapPin size={12} className="text-gold-600" /> {p.location}</p>
      </div>
    </div>
  );
}

export default function SpecialtyPageTemplate({ content }: { content: SpecialtyContent }) {
  const physicianList = content.physicianDisciplines?.length
    ? physicians.filter((p) => content.physicianDisciplines!.some((d) => p.disciplines.includes(d)))
    : [];

  const tabs = ["Overview", "What We Treat", ...(physicianList.length > 0 ? ["Physicians"] : []), "Contact"] as const;
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
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">
          ANRA Health — Medical Specialties{content.partnerLine ? ` · ${content.partnerLine}` : ""}
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">{content.label}</h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">{content.tagline}</p>
      </div>

      <div className="flex md:justify-center gap-2 px-6 pb-10 overflow-x-auto md:overflow-visible md:flex-wrap no-scrollbar">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {tab === "Overview" && (
          <div className="space-y-6">
            <IconHero icon={content.icon} />
            <div className="glass rounded-3xl p-6 md:p-10">
              {content.overview.map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-graphite-700 mb-4 last:mb-0">{p}</p>
              ))}
            </div>
            <div className="glass rounded-3xl p-6 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">When Should You See Us?</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-6">{content.whenToSee}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">Referral Requirements</p>
              <p className="text-base leading-relaxed text-graphite-700">{content.referralNote || STANDARD_REFERRAL_NOTE}</p>
            </div>
          </div>
        )}

        {tab === "What We Treat" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {content.conditionsTreated.map((c) => (
              <div key={c} className="glass rounded-2xl p-5 flex items-start gap-3 card-hover">
                <CheckCircle2 size={16} className="text-gold-500 mt-0.5 shrink-0" />
                <p className="text-sm text-graphite-700 leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Physicians" && physicianList.length > 0 && (
          <div className="space-y-6">
            {content.physicianNote && (
              <p className="text-sm text-graphite-600 leading-relaxed max-w-2xl">{content.physicianNote}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-5">
              {physicianList.map((p) => <PhysicianCard key={p.slug} p={p} />)}
            </div>
          </div>
        )}

        {tab === "Contact" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {locations.map((l) => (
              <div key={l.tag} className="glass rounded-2xl p-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">{l.tag}</p>
                <h3 className="text-xl font-bold text-graphite-900 mb-4">{l.name}</h3>
                <div className="space-y-2.5 text-sm text-graphite-600 mb-5">
                  <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold-600" /> {l.address}</p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-gold-600" /> {l.phone}</p>
                  <p className="flex items-center gap-2"><Clock size={14} className="text-gold-600" /> {brand.hours}</p>
                </div>
                <iframe title={l.name} className="w-full h-44 rounded-xl border-0" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(l.address)}&output=embed`} />
              </div>
            ))}
            <div className="glass rounded-2xl p-7 sm:col-span-2 text-center">
              <p className="text-sm text-graphite-600 mb-4">Ready to book? Start a referral through our Referral Centre.</p>
              <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
                Go to Referral Centre <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}