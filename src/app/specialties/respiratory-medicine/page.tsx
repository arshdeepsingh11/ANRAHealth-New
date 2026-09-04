"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, X, ChevronRight, ExternalLink, Volume2, VolumeX } from "lucide-react";
import SymptomChecker from "@/components/SymptomChecker";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(58,70,63,0.55)" }} onClick={onClose}>
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

function RespiratoryVideoHero() {
  // Muted by default (required for autoplay in most browsers); user can unmute via the custom control.
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleMute = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    const command = muted ? "unMute" : "mute";
    iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), "*");
    setMuted((m) => !m);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ height: "460px" }}>
      <iframe
        ref={iframeRef}
        src="https://www.youtube.com/embed/EGvIyhiNohk?autoplay=1&mute=1&loop=1&playlist=EGvIyhiNohk&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1"
        title="Respiratory Medicine — ANRA Health"
        allow="autoplay; encrypted-media"
        className="absolute inset-0 w-full h-full"
        style={{ border: 0, pointerEvents: "none" }}
      />
      {/* Scrim kept dark intentionally, for text readability over the video */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(20,22,15,0.88) 0%, rgba(20,22,15,0.45) 55%, rgba(20,22,15,0.15) 100%)" }} />

      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center glass"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? <VolumeX size={16} className="text-graphite-900" /> : <Volume2 size={16} className="text-graphite-900" />}
      </button>

      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-gold-300">Respiratory • Sleep • Allergy • Cardiac</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-3 max-w-2xl">Sleep Well. Breathe Easy. Live Better.</h2>
        <p className="text-sm md:text-base text-white/85 max-w-xl leading-relaxed">
          In partnership with Advanced Respiratory Care Network — comprehensive respiratory, sleep, and oxygen care across Alberta.
        </p>
      </div>

      {/* Small, unobtrusive video source credit — bottom-left, per licensing agreement with the video owner */}
      <p className="absolute bottom-2 left-3 z-20 text-[10px] text-white/50 tracking-wide">
        Video courtesy of [CREATOR NAME HERE] — used with permission
      </p>
    </div>
  );
}

export default function RespiratoryMedicinePage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [openItem, setOpenItem] = useState<{ name: string; desc: string } | null>(null);

  return (
    <div style={{ minHeight: "100vh" }}>
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
            <RespiratoryVideoHero />

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
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-5">
              {RESPIRATORY_ITEMS.map((t) => (
                <button key={t.name} onClick={() => setOpenItem(t)} className="glass rounded-2xl p-6 card-hover text-left">
                  <h3 className="text-base font-semibold mb-2 text-graphite-900">{t.name}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-3">Read more <ChevronRight size={13} /></span>
                </button>
              ))}
            </div>

            <SymptomChecker specialty="respiratory" />
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