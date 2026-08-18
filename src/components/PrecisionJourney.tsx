"use client";

import React, { useState } from "react";
import { Stethoscope, Activity, Dna, BrainCircuit, ClipboardList, HeartPulse } from "lucide-react";

const STEPS = [
  {
    icon: Stethoscope,
    title: "Consultation",
    desc: "A full review of your history, symptoms, and goals with a board-certified specialist.",
  },
  {
    icon: Activity,
    title: "Diagnostics",
    desc: "Advanced imaging and testing — echocardiography, stress testing, vascular studies, and more.",
  },
  {
    icon: Dna,
    title: "Genomics",
    desc: "Whole genome/exome sequencing and risk panels processed with partner lab BioAro Labs.",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    desc: "Pulse cross-references your diagnostics and genomics against current clinical evidence.",
  },
  {
    icon: ClipboardList,
    title: "Personalized Care Plan",
    desc: "Your physician builds a precision treatment plan grounded in your actual biology.",
  },
  {
    icon: HeartPulse,
    title: "Long-Term Monitoring",
    desc: "Ongoing follow-up and remote monitoring keep your plan current as your health changes.",
  },
];

export default function PrecisionJourney() {
  const [active, setActive] = useState(0);
  const Step = STEPS[active];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Node rail */}
      <div className="relative flex items-center justify-between mb-12 px-2">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-pearl-300" />
        <svg className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-6 -mt-3" viewBox="0 0 1000 24" preserveAspectRatio="none">
          <path d="M0,12 L1000,12" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="1000" strokeDashoffset={1000 - (active / (STEPS.length - 1)) * 1000} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        </svg>

        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === active;
          const isPast = i < active;
          return (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className="relative z-10 flex flex-col items-center gap-2 group"
              aria-label={s.title}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "gold-gloss shadow-glow scale-110"
                    : isPast
                    ? "bg-gold-100 border border-gold-300"
                    : "glass"
                }`}
              >
                <Icon size={20} className={isActive ? "text-graphite-900" : "text-gold-600"} />
              </div>
              <span
                className={`hidden md:block text-xs font-medium text-center max-w-[80px] transition-colors ${
                  isActive ? "text-graphite-900" : "text-graphite-500"
                }`}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      <div className="glass rounded-2xl p-8 md:p-10 min-h-[160px] flex flex-col md:flex-row md:items-center gap-6">
        <div className="gold-gloss w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
          <Step.icon size={26} className="text-graphite-900" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-gold-600 mb-1">
            Step {active + 1} of {STEPS.length}
          </p>
          <h3 className="text-xl font-bold text-graphite-900 mb-2">{Step.title}</h3>
          <p className="text-sm md:text-base text-graphite-600 leading-relaxed">{Step.desc}</p>
        </div>
      </div>

      {/* Mobile step labels (rail hides them above md) */}
      <div className="flex md:hidden justify-between mt-3 px-2">
        {STEPS.map((s, i) => (
          <span key={s.title} className={`text-[10px] text-center flex-1 ${i === active ? "text-gold-700 font-semibold" : "text-graphite-400"}`}>
            {s.title.split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  );
}