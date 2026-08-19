"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, AlertTriangle, ChevronDown, Phone, MapPin, Clock } from "lucide-react";
import SymptomChecker from "@/components/SymptomChecker";
import { physicians } from "@/data/physicians";
import { cardiacSymptoms, faqs, aboutStory, locations, brand } from "@/data/content";

const TABS = ["Overview", "Physicians", "Cardiac Symptoms", "About", "Contact"] as const;
type Tab = (typeof TABS)[number];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-pearl-200 py-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left gap-4">
        <span className="font-semibold text-base text-graphite-900">{q}</span>
        <ChevronDown size={18} className="shrink-0 text-gold-600 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && <p className="text-sm leading-relaxed text-graphite-600 mt-3">{a}</p>}
    </div>
  );
}

export default function CardiologyPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const cardiologists = physicians.filter((p) => p.disciplines.includes("Cardiology"));

  return (
    <div style={{ background: "linear-gradient(160deg, #faf8f3 0%, #f2ede0 45%, #ece2cd 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Medical Specialties</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">Cardiology</h1>
      </div>

      <div className="flex justify-center flex-wrap gap-2 px-6 pb-10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">Conditions Treated</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {["Chest pain", "Arrhythmias", "Coronary artery disease", "Hypertension", "Lipid disorders", "Valve disease", "Preventive cardiology", "Women's heart health"].map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-graphite-700"><span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" /> {c}</div>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">When should you see a cardiologist?</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-6">
                If you experience chest discomfort, shortness of breath, palpitations, dizziness, or have risk factors such as high blood pressure, high cholesterol, diabetes, or a family history of heart disease, a cardiology consultation is recommended.
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">Referral Requirements</p>
              <p className="text-base leading-relaxed text-graphite-700">
                A referral from your family physician is typically required. Referring physicians can submit through our Referral Centre. Please bring your Alberta Health Card, photo ID, and a current medication list to your first appointment.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-bold mb-6 text-graphite-900">Frequently Asked Questions</h2>
              {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        )}

        {tab === "Physicians" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {cardiologists.map((p) => (
              <div key={p.slug} className="glass rounded-2xl p-7 card-hover">
                <h3 className="text-lg font-bold text-graphite-900 mb-1">{p.name}</h3>
                <p className="text-xs font-semibold text-gold-600 mb-4">{p.title}</p>
                <p className="text-sm text-graphite-600 mb-5 leading-relaxed">{p.bio}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">Qualifications</p>
                <ul className="mb-5 space-y-1">
                  {p.qualifications.map((q) => (
                    <li key={q} className="text-xs text-graphite-600 flex gap-2"><span className="text-gold-500">•</span> {q}</li>
                  ))}
                </ul>
                <div className="space-y-1.5 text-xs text-graphite-500 border-t border-pearl-200 pt-4">
                  <p className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0 text-gold-600" /> {p.address}</p>
                  <p className="flex items-center gap-2"><Phone size={13} className="text-gold-600" /> {p.phone}</p>
                  <p className="pt-1">Languages: {p.languages.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Cardiac Symptoms" && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-red-600 py-3 overflow-hidden relative">
              <div className="flex whitespace-nowrap emergency-marquee">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="text-sm md:text-base font-bold text-white flex items-center gap-2 mx-8 shrink-0">
                    <AlertTriangle size={18} className="shrink-0" />
                    Chest pain, difficulty breathing, or a medical emergency? Call 911 immediately.
                  </span>
                ))}
              </div>
              <style>{`
                @keyframes emergency-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .emergency-marquee { animation: emergency-scroll 22s linear infinite; width: max-content; }
              `}</style>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {cardiacSymptoms.map((s) => (
                <div key={s.name} className="glass rounded-2xl p-6 flex gap-4 card-hover">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 shrink-0">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1 text-graphite-900">{s.name}</h3>
                    <p className="text-sm leading-relaxed text-graphite-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <SymptomChecker />
          </div>
        )}

        {tab === "About" && (
          <div className="glass rounded-3xl p-8 md:p-10">
            {aboutStory.split("\n\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-graphite-700 mb-4">{p}</p>
            ))}
            <p className="text-sm text-gold-700 font-semibold mt-6">Founded under the guidance of {brand.founder}</p>
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
          </div>
        )}
      </div>
    </div>
  );
}