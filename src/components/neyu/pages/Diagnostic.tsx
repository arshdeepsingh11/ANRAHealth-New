"use client";

// /diagnostics/[category] — one NEYU template for Cardiac Imaging, Stress Testing,
// Vascular, Monitoring and Pulmonary: hero with a live clinical visual, each test
// with duration and a preparation checklist you can tick, Neyu prep help, and how
// to book. Text from src/data/diagnosticContent.ts.
import React, { useState } from "react";
import { diagnosticContent } from "@/data/diagnosticContent";
import { useAlba } from "@/components/AlbaContext";
import { N, Section, PillarHero, LiveChart, CtaBand, IconTile, cardN, btn, gradText, NeyuReads } from "../kit";
import { NIcon } from "../icons";

const META: Record<string, { icon: string; chart: string; chart2: string; test: Record<string, string> }> = {
  "cardiac-imaging": { icon: "echo", chart: "echo", chart2: "ecg", test: { Echocardiogram: "echo" } },
  "stress-testing": { icon: "steps", chart: "hr", chart2: "ecg", test: { "Stress Echocardiogram": "steps", "Nuclear Stress Test": "scan" } },
  vascular: { icon: "vessel", chart: "flow", chart2: "bp", test: { "Carotid Ultrasound": "vessel", "ABI (Ankle-Brachial Index)": "steps" } },
  monitoring: { icon: "watch", chart: "ecg", chart2: "bp", test: { "Holter Monitoring": "watch", "24-Hour Ambulatory BP Monitoring": "gauge" } },
  pulmonary: { icon: "lungs", chart: "resp", chart2: "aqhi", test: { "Pulmonary Function Testing": "lungs" } },
};

export default function DiagnosticPage({ slug }: { slug: string }) {
  const d = diagnosticContent[slug];
  const m = META[slug];
  const { openAlba } = useAlba();
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <>
      <PillarHero kicker="Diagnostics · Onsite testing" title={<>{d.label}<span style={{ display: "block", fontSize: ".55em", fontWeight: 400, color: N.ink2, marginTop: 8, letterSpacing: "-.02em" }}>{d.tagline}</span></>}
        lead={d.overview} page={`/diagnostics/${slug}`} suggestions={d.tests.slice(0, 2).map((t) => `How do I prepare for ${t.name.split(" (")[0].toLowerCase()}?`).concat(["Do I need a referral for this test?"])}
        visual={<div style={{ ...cardN, padding: 16, display: "grid", gap: 12 }}><LiveChart mode={m.chart} height={190} /><LiveChart mode={m.chart2} height={140} /></div>} />

      <Section tone="white" label="Tests" eyebrow={`${d.tests.length} test${d.tests.length > 1 ? "s" : ""}`} title={<>What to expect, <span style={gradText}>and how to prepare.</span></>} lead="Tick each step as you get ready. Neyu can explain anything in plain language.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 18 }}>
          {d.tests.map((t) => {
            const all = t.prep.every((p) => done[t.name + p]);
            return (
              <div key={t.name} style={{ ...cardN, padding: "clamp(18px,2.6vw,26px)", display: "grid", gap: 14, alignContent: "start" }}>
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}><IconTile icon={m.test[t.name] || m.icon} size={48} active={all} /><span><b style={{ display: "block", fontWeight: 500, fontSize: 20 }}>{t.name}</b><span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 13.5, color: N.muted }}><NIcon name="clock" size={15} tone="grad" />{t.duration}</span></span></span>
                <div role="group" aria-label={`${t.name} preparation checklist`} style={{ display: "grid", gap: 8 }}>
                  {t.prep.map((p) => { const k = t.name + p, on = !!done[k]; return (
                    <button key={p} role="checkbox" aria-checked={on} onClick={() => setDone({ ...done, [k]: !on })} style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", padding: "12px 14px", borderRadius: 14, cursor: "pointer", border: `1px solid ${on ? "rgba(47,191,148,.45)" : N.line}`, background: on ? "rgba(47,191,148,.07)" : "#fff", color: N.ink, fontSize: 15, lineHeight: 1.45 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 7, flex: "none", display: "grid", placeItems: "center", border: `1.5px solid ${on ? "#2FBF94" : N.line}`, background: on ? "linear-gradient(135deg,#2FBF94,#1FA7B4)" : "#fff", marginTop: 1 }}>{on && <NIcon name="check" size={14} tone="light" stroke={2.2} />}</span>
                      <span style={{ textDecoration: on ? "line-through" : "none", color: on ? N.muted : N.ink }}>{p}</span>
                    </button>
                  ); })}
                </div>
                {all && <span role="status" style={{ fontSize: 14, color: "#1F8F6E", display: "flex", gap: 8, alignItems: "center" }}><NIcon name="check" size={16} tone="#1F8F6E" />You're ready for your {t.name.split(" (")[0].toLowerCase()}.</span>}
                <button onClick={() => openAlba(`Explain the ${t.name} — what happens, how long it takes and how to prepare.`)} style={{ ...btn("ghost"), justifySelf: "start", height: 44 }}><NIcon name="spark" size={16} tone="grad" />Ask Neyu about this test</button>
              </div>
            );
          })}
        </div>
        <NeyuReads title="Booking" text={d.referralNote || "Most diagnostic tests require a referral or order from your physician. If you're already a patient, ask your physician about booking. New patients should start with a consultation."} />
      </Section>

      <CtaBand title="Ready to book a test?" text="Ask your physician for an order, or send a referral through our Referral Centre. Questions? Neyu can help you prepare." primary={{ label: "Referral Centre", href: "/referral-centre" }} secondary={{ label: "All diagnostics", href: "/diagnostics" }} />
    </>
  );
}
