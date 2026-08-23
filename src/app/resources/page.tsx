"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowLeft, ChevronDown, Download, FileText, Clock, CheckCircle2, ExternalLink } from "lucide-react";

const TABS = ["Overview", "Test Preparation", "Condition Library", "New Patient Info", "Forms & Referrals"] as const;
type Tab = (typeof TABS)[number];

const TEST_GUIDES = [
  { name: "Echocardiogram", icon: "Waves", prep: ["No special preparation needed", "Wear comfortable, two-piece clothing", "Continue taking your regular medications"], duration: "30–45 minutes" },
  { name: "Stress Echocardiogram", icon: "Activity", prep: ["Wear comfortable clothing and running shoes", "No food or caffeine for 4 hours prior", "Avoid creams or lotions on your chest that day"], duration: "45–60 minutes" },
  { name: "Holter Monitoring", icon: "HeartPulse", prep: ["Shower before your appointment — no bathing with the device on", "Keep a diary of symptoms and activity", "Avoid strong magnets and metal detectors while wearing it"], duration: "24–72 hours (worn continuously)" },
  { name: "24-Hour Ambulatory BP Monitoring", icon: "Gauge", prep: ["Wear a loose-sleeved shirt", "Keep your arm still and relaxed during each reading", "Continue normal daily activities"], duration: "24 hours (worn continuously)" },
  { name: "Carotid Ultrasound", icon: "Radio", prep: ["No special preparation needed", "Avoid turtlenecks or high collars that day"], duration: "20–30 minutes" },
  { name: "ABI (Ankle-Brachial Index)", icon: "Footprints", prep: ["Wear loose-fitting pants that can be rolled up", "Avoid smoking for 30 minutes before the test"], duration: "15–20 minutes" },
  { name: "Pulmonary Function Testing", icon: "Wind", prep: ["Avoid heavy meals for 4–6 hours prior", "No smoking for 24 hours before the test", "Avoid bronchodilator inhalers as instructed by your physician"], duration: "30–45 minutes" },
  { name: "Nuclear Stress Test", icon: "Scan", prep: ["No caffeine for 24 hours prior", "Fast for 4 hours before the test", "Wear comfortable clothing and shoes"], duration: "2–4 hours (includes wait time between imaging)" },
];

const CONDITIONS = [
  { name: "Hypertension (High Blood Pressure)", icon: "Gauge", desc: "A common condition where the force of blood against artery walls is consistently too high, increasing risk of heart disease and stroke over time." },
  { name: "Atrial Fibrillation", icon: "HeartPulse", desc: "An irregular, often rapid heart rhythm that can increase the risk of stroke, heart failure, and other complications." },
  { name: "Coronary Artery Disease", icon: "Heart", desc: "Narrowing or blockage of the coronary arteries, usually caused by plaque buildup, reducing blood flow to the heart muscle." },
  { name: "Heart Failure", icon: "HeartCrack", desc: "A condition where the heart doesn't pump blood as well as it should, leading to fatigue, shortness of breath, and fluid retention." },
  { name: "Type 2 Diabetes", icon: "Droplet", desc: "A chronic condition affecting how the body processes blood sugar, closely linked to cardiovascular risk." },
  { name: "Thyroid Disorders", icon: "CircleDot", desc: "Conditions affecting thyroid hormone production, which can impact metabolism, heart rate, and overall energy." },
];

const NEW_PATIENT_STEPS = [
  { title: "What to Bring", desc: "Alberta Health Card, photo ID, a list of current medications (or the bottles themselves), and any records from procedures done outside Alberta." },
  { title: "Your First Visit", desc: "Vital signs are taken first — blood pressure, heart rate, height, and weight. The physician then completes an interview and physical exam. All information shared is confidential." },
  { title: "Clinic Hours", desc: "Regular hours are 7:30 AM – 5:00 PM, Monday to Friday. Some diagnostic procedures may be available evenings and weekends." },
  { title: "Referrals", desc: "A referral from your family physician is typically required. Physicians can submit through our Referral Centre — automatic AI-assisted or manual." },
];

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${active ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>
      {label}
    </button>
  );
}

function IconPanel({ name }: { name: string }) {
  const Icon = (Icons as any)[name] || Icons.Heart;
  return (
    <div className="h-36 w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F0E1B2 0%, #C9A227 100%)" }}>
      <Icon size={44} className="text-white" strokeWidth={1.5} />
    </div>
  );
}

function ExpandCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-2xl overflow-hidden card-hover">
      <IconPanel name={icon} />
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <h3 className="text-base font-semibold text-graphite-900">{title}</h3>
        <ChevronDown size={16} className="text-gold-600 shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function PatientResourcesPage() {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div style={{ background: "linear-gradient(160deg, #faf8f3 0%, #f2ede0 45%, #ece2cd 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">Patient Resources</h1>
      </div>

      <div className="flex justify-center flex-wrap gap-2 px-6 pb-10">
        {TABS.map((t) => <TabButton key={t} label={t} active={tab === t} onClick={() => setTab(t)} />)}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden flex items-end" style={{ height: "320px", background: "linear-gradient(135deg, #3A362F 0%, #201B11 100%)" }}>
              <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                <Icons.HeartPulse size={220} className="text-gold-400" strokeWidth={1} />
              </div>
              <div className="relative z-10 p-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Everything you need before, during, and after your visit</h2>
                <p className="text-sm text-white/85 max-w-xl">Test preparation guides, condition education, new-patient information, and referral forms — all in one place.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TABS.slice(1).map((t) => (
                <button key={t} onClick={() => setTab(t)} className="glass rounded-2xl p-6 text-center card-hover">
                  <h3 className="text-sm font-display font-bold text-graphite-900">{t}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "Test Preparation" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {TEST_GUIDES.map((g) => (
              <ExpandCard key={g.name} title={g.name} icon={g.icon}>
                <div className="flex items-center gap-2 mb-3 text-xs text-gold-700 font-semibold">
                  <Clock size={13} /> {g.duration}
                </div>
                <ul className="space-y-1.5">
                  {g.prep.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-graphite-600">
                      <CheckCircle2 size={14} className="text-gold-500 mt-0.5 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </ExpandCard>
            ))}
          </div>
        )}

        {tab === "Condition Library" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {CONDITIONS.map((c) => (
              <div key={c.name} className="glass rounded-2xl overflow-hidden card-hover">
                <IconPanel name={c.icon} />
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-2 text-graphite-900">{c.name}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "New Patient Info" && (
          <div className="space-y-4">
            {NEW_PATIENT_STEPS.map((s, i) => (
              <div key={s.title} className="glass rounded-2xl p-6 flex gap-5 items-start card-hover">
                <div className="w-10 h-10 rounded-full gold-gloss flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                <div>
                  <h3 className="text-base font-semibold mb-1.5 text-graphite-900">{s.title}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Forms & Referrals" && (
          <div className="space-y-5">
            <div className="glass rounded-2xl p-7 flex items-center justify-between gap-4 flex-wrap card-hover">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gold-50 shrink-0"><FileText size={20} className="text-gold-600" /></div>
                <div>
                  <h3 className="text-base font-semibold text-graphite-900">Referral Centre</h3>
                  <p className="text-sm text-graphite-600">Manual or AI-assisted referral form, downloadable as PDF.</p>
                </div>
              </div>
              <Link href="/referral-centre" className="gold-gloss rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
                Open <ExternalLink size={14} />
              </Link>
            </div>
            <div className="glass rounded-2xl p-7 flex items-center justify-between gap-4 flex-wrap card-hover">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gold-50 shrink-0"><Download size={20} className="text-gold-600" /></div>
                <div>
                  <h3 className="text-base font-semibold text-graphite-900">Test Preparation Guides</h3>
                  <p className="text-sm text-graphite-600">Printable prep instructions for every diagnostic test we offer.</p>
                </div>
              </div>
              <button onClick={() => setTab("Test Preparation")} className="gold-gloss rounded-full px-5 py-2.5 text-sm font-semibold shrink-0">View</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}