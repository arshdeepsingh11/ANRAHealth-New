"use client";

// /cardiac-symptoms — what each symptom can mean, when it's an emergency, and an
// AI symptom check with Neyu (emergency patterns are checked first, always).
import React, { useState } from "react";
import { cardiacSymptoms, faqs } from "@/data/content";
import SymptomChecker from "@/components/SymptomChecker";
import { N, Section, PillarHero, NeyuReads, CtaBand, IconTile, cardN, gradText, LiveChart } from "../kit";
import { NIcon } from "../icons";

const ICON: Record<string, string> = { "Chest Pain": "heart", "Shortness of Breath": "lungs", Palpitations: "pulse", "Dizziness / Lightheadedness": "compass", Fatigue: "moon", "Swelling (Edema)": "drop" };
const RED_FLAGS = ["Chest pain or pressure that spreads to the arm, jaw or back", "Sudden, severe shortness of breath", "Fainting or loss of consciousness", "Sudden weakness, numbness or slurred speech", "A racing heartbeat with chest pain or fainting"];

export default function SymptomsPage() {
  const [pick, setPick] = useState(cardiacSymptoms[0].name);
  const [faq, setFaq] = useState<number | null>(0);
  const cur = cardiacSymptoms.find((s) => s.name === pick)!;
  return (
    <>
      <div role="alert" style={{ background: "#B8433A", color: "#fff", padding: "12px clamp(16px,4vw,40px)", display: "flex", gap: 10, alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 500, textAlign: "center" }}>
        <NIcon name="alert" size={18} tone="light" />Chest pain, trouble breathing or another emergency? <a href="tel:911" style={{ color: "#fff", fontWeight: 700 }}>Call 911 now.</a>
      </div>
      <PillarHero kicker="Prevention · Know the signs" title={<>Heart symptoms, <span style={gradText}>understood.</span></>}
        lead="What each symptom can mean, when it can wait for a referral and when it can't — explained by Neyu, reviewed against our cardiology team's guidance."
        page="/cardiac-symptoms" suggestions={["Is a fluttering heartbeat dangerous?", "Why do my ankles swell?", "When is chest pain an emergency?"]}
        visual={<div style={{ ...cardN, padding: 16, display: "grid", gap: 12 }}><LiveChart mode="ecg" height={170} /><NeyuReads key={pick} title={`Neyu · ${cur.name}`} text={cur.desc} ask={`What can ${cur.name.toLowerCase()} mean, and when should I see a cardiologist?`} /></div>} />

      <Section tone="white" label="Symptoms" eyebrow="Six symptoms we assess" title={<>Tap a symptom <span style={gradText}>to learn more.</span></>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 14 }}>
          {cardiacSymptoms.map((s) => { const on = s.name === pick; return (
            <button key={s.name} onClick={() => setPick(s.name)} aria-pressed={on} className="sx-card" style={{ ...cardN, padding: 20, textAlign: "left", cursor: "pointer", display: "grid", gap: 10, alignContent: "start", borderColor: on ? "rgba(31,167,180,.5)" : N.line, background: on ? "linear-gradient(160deg,#FFFFFF,#F1F9F7)" : "#fff", color: N.ink }}>
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}><IconTile icon={ICON[s.name] || "heartPulse"} active={on} /><b style={{ fontWeight: 500, fontSize: 18 }}>{s.name}</b></span>
              <span style={{ fontSize: 14.5, lineHeight: 1.55, color: N.ink2 }}>{s.desc}</span>
            </button>
          ); })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 18, alignItems: "start" }}>
          <div style={{ ...cardN, padding: "clamp(18px,3vw,28px)", display: "grid", gap: 12, borderColor: "#F0B9AC", background: "linear-gradient(160deg,#FFFFFF,#FDF3F0)" }}>
            <span style={{ display: "flex", gap: 10, alignItems: "center", color: "#A93A2C", fontWeight: 600 }}><NIcon name="alert" size={20} tone="#A93A2C" />Call 911 — don't wait — if you have:</span>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>{RED_FLAGS.map((r) => <li key={r} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5, color: N.ink }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "#B8433A", marginTop: 9, flex: "none" }} />{r}</li>)}</ul>
            <a href="tel:911" style={{ justifySelf: "start", display: "inline-flex", gap: 8, alignItems: "center", height: 46, padding: "0 20px", borderRadius: 999, background: "#B8433A", color: "#fff", textDecoration: "none", fontWeight: 600 }}><NIcon name="phone" size={17} tone="light" />Call 911</a>
          </div>
          <SymptomChecker specialty="cardiology" />
        </div>
      </Section>

      <Section label="FAQ" eyebrow="Before your visit" title={<>Common <span style={gradText}>questions.</span></>}>
        <div style={{ display: "grid", gap: 10, maxWidth: 860 }}>
          {faqs.map((f, i) => { const on = faq === i; return (
            <div key={f.q} style={{ ...cardN, padding: 0, overflow: "hidden" }}>
              <button onClick={() => setFaq(on ? null : i)} aria-expanded={on} style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "18px 20px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left", fontSize: 16.5, fontWeight: 500, color: N.ink }}>{f.q}<NIcon name={on ? "minus" : "plus"} size={18} tone="grad" /></button>
              {on && <p style={{ margin: 0, padding: "0 20px 18px", fontSize: 15.5, lineHeight: 1.65, color: N.ink2, animation: "fadeUp .25s ease" }}>{f.a}</p>}
            </div>
          ); })}
        </div>
      </Section>
      <CtaBand title="Experiencing symptoms?" text="Ask your family doctor for a cardiology referral — or send one through our Referral Centre. In an emergency, call 911." primary={{ label: "Referral Centre", href: "/referral-centre" }} secondary={{ label: "Cardiology", href: "/specialties/cardiology" }} />
    </>
  );
}
