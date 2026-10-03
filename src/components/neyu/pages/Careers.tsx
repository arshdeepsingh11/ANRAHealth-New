"use client";

// /careers — open roles in the NEYU style, with an interest form that reaches the
// team (Admin → Service requests) and a mailto fallback.
import React, { useState } from "react";
import { careers, brand } from "@/data/content";
import { N, Section, PillarHero, RequestForm, CtaBand, IconTile, cardN, gradText } from "../kit";
import { NIcon } from "../icons";

const ICON: Record<string, string> = { Cardiologist: "heart", "Internal Medicine Physician": "stethoscope", Endocrinologist: "hormone", Sonographer: "echo", "Heart Failure Nurse / LPN": "care" };

export default function CareersPage() {
  const [role, setRole] = useState(careers[0].title);
  return (
    <>
      <PillarHero kicker="Careers at NEYU" title={<>Build the future <span style={gradText}>of connected care.</span></>}
        lead="Join physicians, sonographers and nurses who care for patients in many languages, with onsite diagnostics, genomics and Neyu — our AI companion — working alongside the team."
        page="/careers" suggestions={["What roles are open at NEYU?", "Do you hire allied health staff?"]}
        visual={<div style={{ display: "grid", gap: 10 }}>{careers.map((c) => (
          <button key={c.title} onClick={() => { setRole(c.title); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }} className="sx-card" style={{ ...cardN, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", textAlign: "left", cursor: "pointer", color: N.ink, borderColor: role === c.title ? "rgba(31,167,180,.5)" : N.line }}>
            <IconTile icon={ICON[c.title] || "doctor"} active={role === c.title} /><span style={{ flex: 1 }}><b style={{ display: "block", fontWeight: 500, fontSize: 17 }}>{c.title}</b><span style={{ fontSize: 13.5, color: N.muted }}>{c.type}</span></span><NIcon name="arrow" size={16} tone={N.muted} />
          </button>
        ))}</div>} />
      <Section id="apply" tone="white" label="Apply" eyebrow="Express interest" title={<>Tell us <span style={gradText}>about you.</span></>} lead={`Prefer email? Write to ${brand.email} with the role in the subject line.`}>
        <div style={{ maxWidth: 760 }}><RequestForm key={role} service="careers" title={`Interest: ${role}`} options={{ label: "Role", values: [role, ...careers.map((c) => c.title).filter((t) => t !== role)] }} cta="Send" note="Your details go only to the NEYU hiring team." done="Thank you — the NEYU team will be in touch about next steps." /></div>
      </Section>
      <CtaBand title="Questions about working with us?" text="Our team is happy to talk." primary={{ label: "Email the team", href: `mailto:${brand.email}?subject=Careers` }} secondary={{ label: "About NEYU", href: "/about" }} />
    </>
  );
}
