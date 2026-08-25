"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowLeft, Phone, Mail, MapPin, Clock, X, ChevronRight } from "lucide-react";

const TABS = ["Overview", "Skin Concerns", "Treatments", "Facials & Body", "About", "Contact"] as const;
type Tab = (typeof TABS)[number];

const SKIN_CONCERNS = [
  { name: "Active Acne & Acne Scarring", icon: "Sparkle" },
  { name: "Rosacea", icon: "Flame" },
  { name: "Lines & Wrinkles / Sun Damage", icon: "Sun" },
  { name: "Hyperpigmentation / Melasma", icon: "CircleDot" },
  { name: "Large Pores", icon: "Circle" },
];

const TREATMENTS = [
  { name: "Cosmetic Injectables / Neuromodulators", desc: "Medical-grade injectable treatments to soften fine lines and wrinkles." },
  { name: "Fillers", desc: "Restore volume and contour with dermal filler treatments." },
  { name: "Facial Laser Treatments", desc: "Fotona Laser technology — uniform, predictable, safe results for all skin types and colors." },
  { name: "Hair Restoration", desc: "Treatments designed to support hair health and restoration." },
  { name: "Migraines", desc: "Medical treatment options for migraine management." },
  { name: "Laser Hair Removal", desc: "Long-term hair reduction using advanced laser technology." },
  { name: "Wart Removal", desc: "Safe, effective removal of warts." },
  { name: "Fungal Nail Infection Treatment", desc: "Medical treatment for fungal nail infections." },
  { name: "Snoring & Sleep Apnea", desc: "Non-invasive treatment options for snoring and mild sleep apnea." },
  { name: "Feminine Health", desc: "Treatments focused on women's intimate health and wellness." },
];

const FACIAL_BODY = [
  { name: "NEA Clinical Facial", desc: "A customized medical-grade facial using Luzern, ZO Skin, and Glo Skin lines — deep cleansing, exfoliation, and extractions for hydrated, refreshed skin." },
  { name: "Body Contouring", desc: "Non-invasive body contouring treatments to sculpt and tone." },
  { name: "TruSculpt Flex — Muscle Sculpting", desc: "Clinically proven muscle sculpting that strengthens, tones, and firms the abdomen, buttocks, thighs, arms, and calves." },
  { name: "Muscle Building & Rehabilitation", desc: "Technology-assisted muscle building and rehabilitation programs." },
  { name: "Stretch Mark Treatments", desc: "Treatments designed to reduce the appearance of stretch marks." },
  { name: "Nutrition Enhanced Aesthetics", desc: "Skin nutrition protocols prepared by Registered Dietitians, paired with your personalized skin treatment plan." },
];

function TreatmentModal({ item, onClose }: { item: { name: string; desc: string }; onClose: () => void }) {
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

export default function SkinHealthPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [openItem, setOpenItem] = useState<{ name: string; desc: string } | null>(null);

  return (
    <div style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Medical Specialties · Partner: Nea Precision Skin</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">Skin Health</h1>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">In Partnership With Nea Precision Skin</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-6">
                NEA Medical Aesthetic Clinic is a physician-managed clinic in the heart of Calgary's NE, offering a wide range of minimally invasive, medical-grade skin treatments with a focus on safe, effective, natural-looking results.
              </p>
              <p className="text-base leading-relaxed text-graphite-700">
                We understand the skin-nutrition connection — many of our treatment packages include nutrition protocols prepared by Registered Dietitians, combining the right products with the right foods to help skin stay soft, supple, and youthful.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { t: "Medical-Grade", d: "Luzern, ZO Skin, and Glo Skin professional product lines." },
                { t: "Physician-Managed", d: "Every client consulted individually before any treatment." },
                { t: "For Everyone", d: "Treatments tailored for both women and men." },
              ].map((p) => (
                <div key={p.t} className="glass rounded-2xl p-7 text-center card-hover">
                  <h3 className="text-lg font-display font-bold text-graphite-900 mb-2">{p.t}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Skin Concerns" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {SKIN_CONCERNS.map((s) => {
              const Icon = (Icons as any)[s.icon] || Icons.Sparkles;
              return (
                <div key={s.name} className="glass rounded-2xl p-6 flex items-center gap-4 card-hover">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold-50 shrink-0">
                    <Icon size={18} className="text-gold-600" />
                  </div>
                  <h3 className="text-base font-semibold text-graphite-900">{s.name}</h3>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Treatments" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {TREATMENTS.map((t) => (
              <button key={t.name} onClick={() => setOpenItem(t)} className="glass rounded-2xl p-6 card-hover text-left">
                <h3 className="text-base font-semibold mb-2 text-graphite-900">{t.name}</h3>
                <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-3">Read more <ChevronRight size={13} /></span>
              </button>
            ))}
          </div>
        )}

        {tab === "Facials & Body" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {FACIAL_BODY.map((t) => (
              <button key={t.name} onClick={() => setOpenItem(t)} className="glass rounded-2xl p-6 card-hover text-left">
                <h3 className="text-base font-semibold mb-2 text-graphite-900">{t.name}</h3>
                <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-3">Read more <ChevronRight size={13} /></span>
              </button>
            ))}
          </div>
        )}

        {tab === "About" && (
          <div className="glass rounded-3xl p-8 md:p-10 space-y-4">
            <p className="text-base leading-relaxed text-graphite-700">
              NEA Medical Aesthetic Clinic is located in the heart of Calgary's NE and is a physician-managed clinic with a team of experts delivering quality aesthetic and wellness services.
            </p>
            <p className="text-base leading-relaxed text-graphite-700">
              NEA is one of the first centres to offer Fotona Laser and its full range of applications — state-of-the-art technology delivering uniform, predictable, and safe results across an incredible spectrum of cosmetic laser procedures and medical treatment modes, clinically proven appropriate for all skin types and colors.
            </p>
            <p className="text-base leading-relaxed text-graphite-700">
              Every client is consulted individually before any treatment, with a complimentary in-depth assessment and a fully customized solution plan tailored to their goals.
            </p>
          </div>
        )}

        {tab === "Contact" && (
          <div className="glass rounded-2xl p-7 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">Nea Precision Skin</p>
            <h3 className="text-xl font-bold text-graphite-900 mb-4">NEA Medical Aesthetic Clinic</h3>
            <div className="space-y-2.5 text-sm text-graphite-600 mb-5">
              <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold-600" /> #104, 3151 27 St NE, Calgary, AB</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-gold-600" /> 1-403-230-8812</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-gold-600" /> nea@neaskincare.com</p>
              <p className="flex items-center gap-2"><Clock size={14} className="text-gold-600" /> Mon–Fri: 8:30am–6:00pm, Sat: 9am–5pm</p>
            </div>
            <iframe title="NEA Medical Aesthetic Clinic" className="w-full h-44 rounded-xl border-0" loading="lazy" src="https://www.google.com/maps?q=3151%2027%20St%20NE%2C%20Calgary%2C%20AB&output=embed" />
          </div>
        )}
      </div>

      {openItem && <TreatmentModal item={openItem} onClose={() => setOpenItem(null)} />}
    </div>
  );
}