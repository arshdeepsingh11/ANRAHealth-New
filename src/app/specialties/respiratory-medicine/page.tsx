"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, X, ChevronRight, ExternalLink } from "lucide-react";

const TABS = ["Overview", "Respiratory Diagnostics", "Oxygen Services", "Sleep Apnea & Diagnostics", "What to Expect", "Contact"] as const;
type Tab = (typeof TABS)[number];

const RESPIRATORY_ITEMS = [
  { name: "Pulmonary Function Testing", desc: "PFTs are crucial diagnostic tools used to assess lung function and detect respiratory issues, including asthma, COPD, and other pulmonary concerns." },
  { name: "Allergy Testing", desc: "Respiratory and sleep diagnostics including allergy testing to identify triggers affecting your respiratory health." },
  { name: "Pulmonology Consultation", desc: "Experienced pulmonologists and registered respiratory therapists providing timely, quality medical care for concerns from asthma or COPD to sleep apnea." },
];

const OXYGEN_ITEMS = [
  { name: "Home Oxygen Equipment", desc: "Advanced Respiratory Care Network is an approved Home Oxygen Provider covered by Alberta Aids for Daily Living (AADL)." },
  { name: "Oxygen Safety Guidance", desc: "Full guidance and support for safely living with and using home oxygen equipment." },
];

const SLEEP_ITEMS = [
  { name: "Portable Sleep Study", desc: "A qualified technician sets up a take-home monitor with 3–5 sensors measuring heart rate, oxygen levels, nasal airway pressure, and snoring — one night, no charge for the portable study." },
  { name: "In-Lab Sleep Study (Polysomnography)", desc: "A comprehensive overnight sleep study conducted in a sleep center for a complete diagnostic picture." },
  { name: "CPAP & BiPAP Equipment", desc: "A wide range of CPAP/BiPAP machines, masks, and accessories, chosen to fit each patient's lifestyle, budget, and insurance." },
  { name: "Ongoing CPAP Support", desc: "Immediate, ongoing access to resolve any technical or clinical issues with CPAP machines or sleep therapy." },
];

function ItemModal({ item, onClose }: { item: { name: string; desc: string }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(30,28,24,0.55)" }} onClick={onClose}>
      <div className="glass rounded-3xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-graphite-900">{item.name}</h3>
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700"><X size={20} /></button>
        </div>
        <p className="text-sm text-graphite-600 leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

export default function RespiratoryMedicinePage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [openItem, setOpenItem] = useState<{ name: string; desc: string } | null>(null);

  return (
    <div style={{ background: "linear-gradient(160deg, #23261a 0%, #181a11 45%, #0d0e0a 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Medical Specialties · Partner: Advanced Respiratory Care Network</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">Respiratory Medicine</h1>
        <p className="text-sm text-graphite-500 mt-3 italic">"Sleep Well. Breathe Easy. Live Better." — Respiratory | Sleep | Allergy | Cardiac</p>
      </div>

      <div className="flex justify-center flex-wrap gap-2 px-6 pb-10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">In Partnership With Advanced Respiratory Care Network</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-6">
                The Advanced Respiratory Care Network specializes in Obstructive Sleep Apnea, Sleep Consultation and Diagnostics, Home Oxygen Services, Respiratory Consultation and Diagnostics, and Cardiology — with experienced pulmonologists and registered respiratory therapists.
              </p>
              <p className="text-base leading-relaxed text-graphite-700">
                Patients are never rushed — they're carefully guided through education and motivation for effective, lasting outcomes, whether that's respiratory diagnostics, home oxygen support, or sleep apnea treatment.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {["Respiratory Diagnostics", "Oxygen Services", "Sleep Apnea", "Sleep Diagnostics"].map((c) => (
                <div key={c} className="glass rounded-2xl p-6 text-center card-hover">
                  <h3 className="text-sm font-display font-bold text-graphite-900">{c}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Respiratory Diagnostics" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {RESPIRATORY_ITEMS.map((t) => (
              <button key={t.name} onClick={() => setOpenItem(t)} className="glass rounded-2xl p-6 card-hover text-left">
                <h3 className="text-base font-semibold mb-2 text-graphite-900">{t.name}</h3>
                <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-3">Read more <ChevronRight size={13} /></span>
              </button>
            ))}
          </div>
        )}

        {tab === "Oxygen Services" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {OXYGEN_ITEMS.map((t) => (
              <button key={t.name} onClick={() => setOpenItem(t)} className="glass rounded-2xl p-6 card-hover text-left">
                <h3 className="text-base font-semibold mb-2 text-graphite-900">{t.name}</h3>
                <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-3">Read more <ChevronRight size={13} /></span>
              </button>
            ))}
          </div>
        )}

        {tab === "Sleep Apnea & Diagnostics" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {SLEEP_ITEMS.map((t) => (
              <button key={t.name} onClick={() => setOpenItem(t)} className="glass rounded-2xl p-6 card-hover text-left">
                <h3 className="text-base font-semibold mb-2 text-graphite-900">{t.name}</h3>
                <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-3">Read more <ChevronRight size={13} /></span>
              </button>
            ))}
          </div>
        )}

        {tab === "What to Expect" && (
          <div className="glass rounded-3xl p-8 md:p-10 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">Step 1 — Referral</p>
              <p className="text-base leading-relaxed text-graphite-700">Your family doctor refers you for a portable sleep test or an in-lab sleep study (polysomnography).</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">Step 2 — Testing</p>
              <p className="text-base leading-relaxed text-graphite-700">A qualified technician sets up the monitor and educates you on how to use it overnight at home. You'll wear 3–5 sensors collecting heart rate, oxygen levels, nasal airway pressure, and snoring data — one night only. The portable sleep study currently has no charge.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">Step 3 — Results & Next Steps</p>
              <p className="text-base leading-relaxed text-graphite-700">If the study confirms sleep apnea, our team guides you through education and CPAP/BiPAP equipment options. If negative but symptoms of sleepiness continue, your family doctor may refer you to a sleep physician for further investigation.</p>
            </div>
          </div>
        )}

        {tab === "Contact" && (
          <div className="glass rounded-2xl p-7 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">Advanced Respiratory Care Network</p>
            <h3 className="text-xl font-bold text-graphite-900 mb-4">ARC Network — Alberta</h3>
            <div className="space-y-2.5 text-sm text-graphite-600 mb-5">
              <p className="flex items-center gap-2"><Phone size={14} className="text-gold-600" /> 1-866-521-2726</p>
              <p className="flex items-center gap-2"><ExternalLink size={14} className="text-gold-600" /> arcnetwork.ca</p>
            </div>
            <p className="text-xs text-graphite-400">Serving Northern, Central, and Southern Alberta.</p>
          </div>
        )}
      </div>

      {openItem && <ItemModal item={openItem} onClose={() => setOpenItem(null)} />}
    </div>
  );
}