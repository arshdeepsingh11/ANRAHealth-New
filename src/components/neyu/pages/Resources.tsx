"use client";

// /resources — patient resources in the NEYU style: test preparation (from the
// diagnostic content), a condition library Neyu can explain, new-patient info,
// and forms & AI tools (Referral Centre, Lab Result Explainer, Explain My Diagnosis).
import React, { useEffect, useState } from "react";
import { diagnosticContent } from "@/data/diagnosticContent";
import { useAlba } from "@/components/AlbaContext";
import { N, Section, PillarHero, CtaBand, IconTile, cardN, btn, gradText, NeyuReads } from "../kit";
import { NIcon } from "../icons";
import { PillNav } from "../fx";

type Tab = "prep" | "conditions" | "new" | "tools";
const TEST_ICON: Record<string, string> = { Echocardiogram: "echo", "Stress Echocardiogram": "steps", "Nuclear Stress Test": "scan", "Carotid Ultrasound": "vessel", "ABI (Ankle-Brachial Index)": "steps", "Holter Monitoring": "watch", "24-Hour Ambulatory BP Monitoring": "gauge", "Pulmonary Function Testing": "lungs" };
const TESTS = Object.values(diagnosticContent).flatMap((d) => d.tests.map((t) => ({ ...t, area: d.label, href: `/diagnostics/${d.slug}` })));
const CONDITIONS = [
  { name: "Hypertension (high blood pressure)", icon: "gauge", desc: "A common condition where the force of blood against artery walls is consistently too high, increasing the risk of heart disease and stroke over time." },
  { name: "Atrial fibrillation", icon: "pulse", desc: "An irregular, often rapid heart rhythm that can increase the risk of stroke, heart failure and other complications." },
  { name: "Coronary artery disease", icon: "heart", desc: "Narrowing or blockage of the coronary arteries, usually caused by plaque build-up, reducing blood flow to the heart muscle." },
  { name: "Heart failure", icon: "heartPulse", desc: "A condition where the heart doesn't pump blood as well as it should, leading to fatigue, shortness of breath and fluid retention." },
  { name: "Type 2 diabetes", icon: "drop", desc: "A chronic condition affecting how the body processes blood sugar, closely linked to cardiovascular risk." },
  { name: "Thyroid disorders", icon: "hormone", desc: "Conditions affecting thyroid hormone production, which can affect metabolism, heart rate and energy." },
];
const NEW_PATIENT = [
  { t: "What to bring", icon: "idcard", d: "Alberta Health Card, photo ID, a list of current medications (or the bottles themselves), and any records from procedures done outside Alberta." },
  { t: "Your first visit", icon: "stethoscope", d: "Vital signs are taken first — blood pressure, heart rate, height and weight. The physician then completes an interview and physical exam. Everything you share is confidential." },
  { t: "Clinic hours", icon: "clock", d: "7:30 AM – 5:00 PM, Monday to Friday. Some diagnostic procedures may be available on evenings and weekends." },
  { t: "Referrals", icon: "referral", d: "A referral from your family physician is typically required. Physicians can send one through our Referral Centre — AI-assisted or manual." },
];
const TOOLS = [
  { t: "Referral Centre", icon: "referral", d: "Physicians: send a referral in seconds — describe the patient or scan a referral, and Neyu fills the form.", href: "/referral-centre" },
  { t: "Lab Result Explainer", icon: "flask", d: "Paste values or scan a report: each result explained in plain language, in context.", href: "/lab-results" },
  { t: "Explain My Diagnosis", icon: "doc", d: "Type a diagnosis or a line from a report — Neyu explains what it generally means and what to ask.", href: "/explain-diagnosis" },
  { t: "Cardiac symptoms", icon: "heartPulse", d: "Know the signs, when it's an emergency, and an AI symptom check.", href: "/cardiac-symptoms" },
];

export default function ResourcesPage() {
  const { openAlba } = useAlba();
  const [tab, setTab] = useState<Tab>("prep");
  const [q, setQ] = useState("");
  useEffect(() => { const t = new URLSearchParams(window.location.search).get("tab") as Tab | null; if (t && ["prep", "conditions", "new", "tools"].includes(t)) setTab(t); }, []);
  const tests = TESTS.filter((t) => (t.name + t.area).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PillarHero kicker="Patient resources" title={<>Before, during <span style={gradText}>and after your visit.</span></>}
        lead="Test preparation, a condition library Neyu explains, new-patient information and the AI tools that make every step clearer."
        page="/resources" suggestions={["How do I prepare for a stress echo?", "What should I bring to my first visit?", "What is atrial fibrillation?"]}
        stats={[{ v: TESTS.length, l: "test prep guides" }, { v: CONDITIONS.length, l: "conditions explained" }, { v: TOOLS.length, l: "AI tools" }]}
        visual={<div style={{ display: "grid", gap: 10 }}>{TOOLS.slice(0, 3).map((t) => <a key={t.t} href={t.href} className="sx-card" style={{ ...cardN, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", textDecoration: "none", color: N.ink }}><IconTile icon={t.icon} /><span style={{ flex: 1 }}><b style={{ display: "block", fontWeight: 500, fontSize: 17 }}>{t.t}</b><span style={{ fontSize: 13.5, color: N.muted, lineHeight: 1.4 }}>{t.d}</span></span><NIcon name="arrow" size={16} tone={N.muted} /></a>)}</div>} />
      <Section tone="white" label="Resources">
        <div style={{ display: "flex", justifyContent: "center" }}><PillNav label="Resource sections" tabs={[{ k: "prep", label: "Test preparation", icon: "doc" }, { k: "conditions", label: "Condition library", icon: "book" }, { k: "new", label: "New patients", icon: "user" }, { k: "tools", label: "Forms & AI tools", icon: "spark" }]} value={tab} onChange={(k) => setTab(k as Tab)} /></div>
        <div key={tab} style={{ animation: "fadeUp .3s ease", display: "grid", gap: 16 }}>
          {tab === "prep" && <>
            <label style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 460, padding: "0 16px", height: 50, borderRadius: 999, border: `1px solid ${N.line}`, background: "#fff" }}><NIcon name="search" size={18} tone="grad" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tests" aria-label="Search tests" style={{ flex: 1, minWidth: 0, border: 0, outline: "none", fontSize: 16, background: "transparent", color: N.ink }} /></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: 14 }}>
              {tests.map((t) => (
                <div key={t.name} style={{ ...cardN, padding: 20, display: "grid", gap: 10, alignContent: "start" }}>
                  <span style={{ display: "flex", gap: 12, alignItems: "center" }}><IconTile icon={TEST_ICON[t.name] || "pulse"} /><span><b style={{ display: "block", fontWeight: 500, fontSize: 17 }}>{t.name}</b><span style={{ fontSize: 13, color: N.muted, display: "inline-flex", gap: 6, alignItems: "center" }}><NIcon name="clock" size={14} tone="grad" />{t.duration}</span></span></span>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>{t.prep.map((p) => <li key={p} style={{ display: "flex", gap: 8, fontSize: 14.5, lineHeight: 1.5, color: N.ink2 }}><NIcon name="check" size={16} tone="#1F9E7A" style={{ marginTop: 2 }} />{p}</li>)}</ul>
                  <a href={t.href} style={{ fontSize: 13.5, color: N.deep, fontWeight: 600, textDecoration: "none" }}>{t.area} · checklist →</a>
                </div>
              ))}
            </div>
          </>}
          {tab === "conditions" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: 14 }}>
            {CONDITIONS.map((c) => <button key={c.name} onClick={() => openAlba(`Explain ${c.name.toLowerCase()} in plain language — causes, tests and treatment.`)} className="sx-card" style={{ ...cardN, padding: 20, display: "grid", gap: 10, alignContent: "start", textAlign: "left", cursor: "pointer", color: N.ink }}><IconTile icon={c.icon} /><b style={{ fontWeight: 500, fontSize: 18 }}>{c.name}</b><span style={{ fontSize: 14.5, lineHeight: 1.55, color: N.ink2 }}>{c.desc}</span><span style={{ fontSize: 13.5, fontWeight: 600, color: N.deep, display: "inline-flex", gap: 6, alignItems: "center" }}><NIcon name="spark" size={15} tone="grad" />Ask Neyu to explain</span></button>)}
          </div>}
          {tab === "new" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 }}>
            {NEW_PATIENT.map((n, i) => <div key={n.t} style={{ ...cardN, padding: 20, display: "grid", gap: 10, alignContent: "start" }}><span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><IconTile icon={n.icon} /><span style={{ fontSize: 12, color: N.faint, letterSpacing: ".14em" }}>0{i + 1}</span></span><b style={{ fontWeight: 500, fontSize: 18 }}>{n.t}</b><span style={{ fontSize: 14.5, lineHeight: 1.55, color: N.ink2 }}>{n.d}</span></div>)}
          </div>}
          {tab === "tools" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 }}>
            {TOOLS.map((t) => <a key={t.t} href={t.href} className="sx-card" style={{ ...cardN, padding: 20, display: "grid", gap: 10, alignContent: "start", textDecoration: "none", color: N.ink }}><IconTile icon={t.icon} /><b style={{ fontWeight: 500, fontSize: 18 }}>{t.t}</b><span style={{ fontSize: 14.5, lineHeight: 1.55, color: N.ink2 }}>{t.d}</span><span style={{ fontSize: 13.5, fontWeight: 600, color: N.deep }}>Open →</span></a>)}
          </div>}
        </div>
        <NeyuReads text="Not sure where to start? Ask Neyu — it can explain a test, a result or a diagnosis in plain language. It never diagnoses; your care team does." ask="Help me prepare for my appointment." />
      </Section>
      <CtaBand title="Still have questions?" text="Call either clinic, or ask Neyu any time." primary={{ label: "Contact", href: "/contact" }} secondary={{ label: "Ask Neyu", alba: "" }} />
    </>
  );
}
