"use client";

// Right-hand side sheets: create/edit forms, AI item review, referral detail
// and audit event detail. Staff never lose their place in the list behind.

import React, { useEffect, useState } from "react";
import type { AiDetailDTO, RefDTO, AuditDTO } from "@/lib/admin/types";
import { physicians } from "@/data/physicians";
import { useAdmin, getView, type FormType } from "./context";
import { T, S, Chip, Orb, TestTag, chip } from "./ui";
import { decAI } from "./screens/AiActivity";
import { refUrg, refSt } from "./screens/Patient360";
import { moveReferral } from "./screens/Referrals";

export function Sheet({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(29,35,39,.14)", animation: "anraFade 200ms" }}>
      <aside role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 12, right: 12, bottom: 12, width: "min(520px, calc(100vw - 24px))", background: T.card, borderRadius: 24, boxShadow: `${T.shadow},0 0 0 1px ${T.line}`, display: "flex", flexDirection: "column", overflow: "hidden", animation: "anraSheet 300ms cubic-bezier(.2,.8,.2,1)" }}>
        {children}
      </aside>
    </div>
  );
}
const CloseBtn = ({ onClose }: { onClose: () => void }) => <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: T.side, cursor: "pointer", fontSize: 16, flex: "none", color: T.ink }}><i className="ph ph-x" /></button>;
const Body = ({ children, gap = 16, wrap }: { children: React.ReactNode; gap?: number; wrap?: boolean }) => <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "4px 24px 20px", display: "flex", flexDirection: wrap ? "row" : "column", flexWrap: wrap ? "wrap" : undefined, alignContent: wrap ? "flex-start" : undefined, gap }}>{children}</div>;
const Foot = ({ children }: { children: React.ReactNode }) => <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${T.line}`, flexWrap: "wrap" }}>{children}</div>;
const btn2 = { height: 42, padding: "0 16px", borderRadius: 12, border: `1px solid ${T.line3}`, background: T.card, fontSize: 14.5, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", color: T.ink, display: "inline-flex", gap: 8, alignItems: "center" } as React.CSSProperties;
const btnP = { height: 42, padding: "0 18px", borderRadius: 12, border: "none", background: T.teal, color: T.card, fontSize: 14.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" } as React.CSSProperties;

// ── Form sheet ───────────────────────────────────────────────────────────
type Field = { k: string; l: string; t: "ro" | "text" | "seg" | "select" | "area" | "date" | "datetime"; req?: boolean; ph?: string; half?: boolean; o?: (string | [string, string])[] };
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });
const nowLocal = () => { const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Edmonton" })); return `${today()}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const TIMES = ["8:00 a.m.", "8:30 a.m.", "9:00 a.m.", "9:30 a.m.", "10:00 a.m.", "10:30 a.m.", "11:00 a.m.", "11:30 a.m.", "12:00 p.m.", "1:00 p.m.", "1:30 p.m.", "2:00 p.m.", "2:30 p.m.", "3:00 p.m.", "3:30 p.m.", "4:00 p.m.", "4:30 p.m."];
const DOCS = physicians.map((p) => p.name);

function defaults(type: FormType, actor: string): Record<string, string> {
  return ({
    lab: { test: "", status: "Pending", value: "", unit: "", range: "", collected: today(), panel: "Cardiac markers", source: "BioAro Labs", explanation: "" },
    protocol: { name: "", timing: "Morning", dose: "", guidance: "", source: DOCS[0], start: today(), end: "" },
    appt: { clinician: "", location: "North East", date: "", time: "9:30 a.m.", type: "Follow-up", prep: "Wearables and labs shared", notes: "" },
    care: { member: "", role: "Consulting physician", location: "North East" },
    reading: { type: "Blood pressure", value: "", unit: "mmHg", when: nowLocal(), source: "Clinic device", by: actor },
    link: { referralId: "", note: "" },
    schedule: { date: "", time: "9:30 a.m." },
  } as Record<FormType, Record<string, string>>)[type];
}

function defsFor(type: FormType, v: Record<string, string>, edit: boolean, refs: [string, string][]): { title: string; sub: string; save: string; fields: Field[] } {
  switch (type) {
    case "lab": return { title: "Add lab result", sub: "Adds to Labs and the patient timeline. Creates an audit event.", save: "Save result", fields: [
      { k: "patient", l: "Patient", t: "ro" }, { k: "test", l: "Test", t: "text", req: true, ph: "e.g. hs-Troponin T" }, { k: "status", l: "Status", t: "seg", o: ["Pending", "Final"] },
      { k: "value", l: "Value", t: "text", req: v.status === "Final", ph: v.status === "Pending" ? "Optional while pending" : "e.g. 12", half: true }, { k: "unit", l: "Unit", t: "text", req: true, ph: "e.g. ng/L", half: true },
      { k: "range", l: "Reference range", t: "text", ph: "e.g. < 14 or 4.0–5.9", half: true }, { k: "collected", l: "Collected date", t: "date", req: true, half: true },
      { k: "panel", l: "Panel", t: "select", o: ["Cardiac markers", "Lipid panel", "Metabolic panel", "CBC", "Thyroid panel", "Inflammation", "Other"], half: true }, { k: "source", l: "Source", t: "select", o: ["BioAro Labs", "ANRA clinic", "External lab"], half: true },
      { k: "explanation", l: "Staff note", t: "area", ph: "Optional note for the care team (not shown to the patient)" }] };
    case "protocol": return { title: edit ? "Edit protocol item" : "Add protocol item", sub: "Changes appear in the patient’s protocol in My Health Space.", save: edit ? "Save changes" : "Add to protocol", fields: [
      { k: "name", l: "Protocol", t: "text", req: true, ph: "e.g. Atorvastatin" }, { k: "timing", l: "Timing", t: "seg", o: ["Morning", "Midday", "Evening"] },
      { k: "dose", l: "Dose", t: "text", req: true, ph: "e.g. 20 mg", half: true }, { k: "source", l: "Source", t: "select", o: [...DOCS, "BioAro Drugs", "Care plan"], half: true },
      { k: "guidance", l: "Guidance", t: "area", ph: "How and when to take it" }, { k: "start", l: "Start date", t: "date", req: true, half: true }, { k: "end", l: "End date (optional)", t: "date", half: true }] };
    case "appt": return { title: edit ? "Reschedule appointment" : "Book appointment", sub: "The patient sees it in My Health Space.", save: edit ? "Save new time" : "Book appointment", fields: [
      { k: "patient", l: "Patient", t: "ro" }, { k: "clinician", l: "Clinician", t: "select", req: true, o: [["", "Select…"], ...DOCS.map((d) => [d, d] as [string, string])] }, { k: "location", l: "Location", t: "seg", o: ["North East", "Meadow Miles"] },
      { k: "date", l: "Date", t: "date", req: true, half: true }, { k: "time", l: "Time", t: "select", o: TIMES, half: true },
      { k: "type", l: "Appointment type", t: "select", o: ["Follow-up", "New consult", "Test review", "Annual review"] },
      ...(edit ? [] : [{ k: "prep", l: "Visit-prep sharing", t: "select" as const, o: ["Wearables and labs shared", "Labs only", "Wearables only", "Not shared"] }]),
      { k: "notes", l: "Notes", t: "area", ph: "Visible to staff only" }] };
    case "care": return { title: "Add care team member", sub: "Care team members appear on the patient’s record and in My Health Space.", save: "Add member", fields: [
      { k: "member", l: "Clinician", t: "select", req: true, o: [["", "Select…"], ...physicians.map((p) => [p.slug, `${p.name} · ${p.disciplines[0]}`] as [string, string])] },
      { k: "role", l: "Role", t: "select", o: ["Most responsible physician", "Consulting physician", "Care coordinator", "Nurse practitioner"] }, { k: "location", l: "Location", t: "seg", o: ["North East", "Meadow Miles"] }] };
    case "reading": return { title: "Add clinic reading", sub: "Recorded as a clinic reading, separate from wearable data.", save: "Save reading", fields: [
      { k: "type", l: "Reading", t: "select", o: ["Blood pressure", "Heart rate", "SpO₂"] }, { k: "value", l: "Value", t: "text", req: true, ph: v.type === "Blood pressure" ? "e.g. 128/82" : v.type === "SpO₂" ? "e.g. 97" : "e.g. 72", half: true },
      { k: "unit", l: "Unit", t: "ro", half: true }, { k: "when", l: "Date and time", t: "datetime", req: true }, { k: "source", l: "Source", t: "select", o: ["Clinic device", "Manual entry"] }, { k: "by", l: "Entered by", t: "ro" }] };
    case "link": return { title: "Link referral", sub: "Attach an unlinked referral to this patient record.", save: "Link referral", fields: [
      { k: "referralId", l: "Referral", t: "select", req: true, o: [["", refs.length ? "Select…" : "No unlinked referrals"], ...refs] }, { k: "note", l: "Staff note", t: "area", ph: "Why this referral belongs to this patient" }] };
    case "schedule": return { title: `Schedule ${v.code || "referral"}`, sub: `Sets the visit date for ${v.patient || "this referral"} and moves it to Scheduled. Book the appointment itself from the patient's record.`, save: "Move to Scheduled", fields: [
      { k: "date", l: "Visit date", t: "date", req: true, half: true }, { k: "time", l: "Time", t: "select", o: TIMES, half: true }] };
  }
}

const UNITS: Record<string, string> = { "Blood pressure": "mmHg", "Heart rate": "bpm", "SpO₂": "%" };

export function FormSheet({ type, patientId, init, editId, onClose }: { type: FormType; patientId: string; init: Record<string, string>; editId?: string; onClose: () => void }) {
  const a = useAdmin();
  const [v, setV] = useState<Record<string, string>>(() => ({ ...defaults(type, a.actor), ...init }));
  const [errs, setErrs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refs, setRefs] = useState<[string, string][]>([]);
  useEffect(() => { if (type === "link") getView<{ rows: RefDTO[] }>("unlinked-referrals").then((d) => setRefs(d.rows.map((r) => [r.id, `${r.code} · ${r.patient} · ${r.specialty}`]))).catch(() => {}); }, [type]);
  const def = defsFor(type, v, !!editId, refs);
  const missing = def.fields.filter((f) => f.req && !String(v[f.k] || "").trim());
  const set = (k: string, val: string) => setV((x) => ({ ...x, [k]: val, ...(k === "type" && type === "reading" ? { unit: UNITS[val] || "" } : {}) }));

  const save = async () => {
    if (busy) return;
    if (missing.length) { setErrs(true); return; }
    setBusy(true);
    const payload: Record<string, unknown> = { patientId, ...v };
    const map: Record<FormType, [string, string, (r: any) => string]> = {
      lab: ["lab.add", "Lab result added", () => "Patient timeline updated."],
      protocol: ["protocol.save", editId ? "Protocol updated" : "Protocol item added", () => "Patient timeline updated."],
      appt: ["appt.save", editId ? "Appointment rescheduled" : "Appointment booked", (r) => r?.message || ""],
      care: ["care.add", "Care team member added", () => "Patient timeline updated."],
      reading: ["reading.add", "Clinic reading added", () => "Patient timeline updated."],
      link: ["referral.link", "Referral linked", () => "It's now part of this record."],
      schedule: ["referral.status", `Referral ${v.code || ""} moved to Scheduled`.replace("  ", " "), () => "Status history and audit log updated."],
    };
    const [action, title, sub] = map[type];
    if (type === "protocol" && editId) payload.itemId = editId;
    if (type === "appt" && editId) payload.apptId = editId;
    if (type === "schedule") Object.assign(payload, { id: v.refId, status: "scheduled" });
    try {
      await a.act({ action, ...payload }, { success: title, sub, undoable: type === "lab" || type === "schedule" });
      onClose();
    } catch { setBusy(false); }
  };

  return (
    <Sheet onClose={onClose} label={def.title}>
      <div data-screen-label="20 Form Sheet" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "22px 24px 16px" }}>
          <div style={{ flex: 1 }}><h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>{def.title}</h2><p style={{ margin: "4px 0 0", fontSize: 13.5, color: T.faint }}>{def.sub}</p></div>
          <CloseBtn onClose={onClose} />
        </div>
        <Body wrap>
          {errs && missing.length > 0 && <div role="alert" style={{ width: "100%", display: "flex", gap: 8, alignItems: "center", background: T.peach, color: T.peachInk, borderRadius: 12, padding: "10px 12px", fontSize: 14 }}><i className="ph ph-warning-circle" />{missing.length} required field{missing.length > 1 ? "s" : ""} still empty.</div>}
          {def.fields.map((f) => {
            const val = v[f.k] ?? "";
            const err = errs && f.req && !String(val).trim();
            const bd = err ? T.peachInk : T.line3;
            const id = "f_" + f.k;
            const input = { height: 44, borderRadius: 12, border: `1px solid ${bd}`, background: T.card, padding: "0 14px", fontSize: 15, color: T.ink, outline: "none", width: "100%" } as React.CSSProperties;
            return (
              <div key={f.k} style={{ width: f.half && !a.mobile ? "calc(50% - 8px)" : "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: T.ink2 }}>{f.l}{f.req ? " *" : ""}</label>
                {f.t === "ro" && <div id={id} style={{ height: 44, borderRadius: 12, background: T.side, padding: "0 14px", display: "flex", alignItems: "center", fontSize: 15, color: T.ink }}>{val || "—"}</div>}
                {f.t === "text" && <input id={id} className="f-teal" value={val} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} aria-invalid={!!err} style={input} />}
                {f.t === "date" && <input id={id} className="f-teal" type="date" value={val} onChange={(e) => set(f.k, e.target.value)} aria-invalid={!!err} style={input} />}
                {f.t === "datetime" && <input id={id} className="f-teal" type="datetime-local" value={val} onChange={(e) => set(f.k, e.target.value)} aria-invalid={!!err} style={input} />}
                {f.t === "area" && <textarea id={id} className="f-teal" value={val} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} rows={3} style={{ borderRadius: 12, border: `1px solid ${T.line3}`, background: T.card, padding: "10px 14px", fontSize: 15, color: T.ink, outline: "none", resize: "vertical", fontFamily: "inherit" }} />}
                {f.t === "select" && <select id={id} className="f-teal" value={val} onChange={(e) => set(f.k, e.target.value)} aria-invalid={!!err} style={{ ...input, padding: "0 12px" }}>{(f.o || []).map((o) => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return <option key={ov} value={ov}>{ol}</option>; })}</select>}
                {f.t === "seg" && (
                  <div role="radiogroup" aria-label={f.l} style={{ display: "flex", gap: 2, padding: 3, borderRadius: 12, background: T.stone }}>
                    {(f.o as string[]).map((o) => <button key={o} type="button" role="radio" aria-checked={val === o} onClick={() => set(f.k, o)} style={{ flex: 1, height: 36, border: "none", borderRadius: 9, background: val === o ? T.card : "transparent", color: val === o ? T.ink : T.ink2, boxShadow: val === o ? "0 1px 3px rgba(29,35,39,.12)" : "none", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 200ms" }}>{o}</button>)}
                  </div>
                )}
                {err && <span style={{ fontSize: 13, color: T.peachInk, display: "flex", gap: 5, alignItems: "center" }}><i className="ph ph-warning-circle" />{f.l} is required.</span>}
              </div>
            );
          })}
        </Body>
        <Foot>
          <span style={{ flex: 1, fontSize: 13, color: T.faint }}>{missing.length ? `${missing.length} required` : "Ready to save"} · Logged to audit</span>
          <button onClick={onClose} className="h-sand" style={btn2}>Cancel</button>
          <button onClick={save} aria-busy={busy} className="h-primary" style={{ ...btnP, opacity: busy ? 0.75 : 1 }}>{busy ? "Saving…" : def.save}</button>
        </Foot>
      </div>
    </Sheet>
  );
}

// ── AI review sheet ──────────────────────────────────────────────────────
export function AiSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const a = useAdmin();
  const [x, setX] = useState<AiDetailDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ans, setAns] = useState(false);
  const [v, setVer] = useState(0);
  useEffect(() => { getView<AiDetailDTO>("ai-item", { id }).then(setX).catch((e) => setErr(e.message)); }, [id, v]);
  const d = x ? decAI(x) : null;
  const openRec = () => { if (!x?.whoId) return; onClose(); a.go(x.isVisitor ? { s: "visitor", id: x.whoId } : { s: "patient", id: x.whoId, tab: x.kind === "symptom" ? "overview" : "ai" }); };
  return (
    <Sheet onClose={onClose} label="AI item">
      <div data-screen-label="12 AI Review" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "22px 24px 14px" }}>
          <Orb size={40} anim />
          <div style={{ flex: 1, minWidth: 0 }}>
            {x ? <>
              <div style={{ fontSize: 13, color: T.lavInk, fontWeight: 500 }}>{d!.kindL} · {x.id}</div>
              <h2 style={{ margin: "2px 0 0", fontSize: 21, fontWeight: 500, letterSpacing: "-0.02em", display: "flex", gap: 8, alignItems: "center" }}>{x.who}<TestTag show={x.test} /></h2>
              <div style={{ fontSize: 13, color: T.faint }}>{x.isVisitor ? "Anonymous visitor" : "Patient · " + x.whoId} · {x.date}, {x.time} · Started from {x.from}</div>
            </> : <div style={{ fontSize: 14, color: T.ink2, paddingTop: 10 }}>{err || "Loading…"}</div>}
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        {x && <Body>
          {x.kind === "symptom" && x.emergency && x.status === "New" && (
            <div role="alert" style={{ background: T.peach, color: T.peachInk, borderRadius: 18, padding: "16px 18px", display: "flex", gap: 12 }}>
              <i className="ph-fill ph-warning-circle" style={{ fontSize: 22 }} />
              <div><div style={{ fontWeight: 600 }}>Emergency-flagged symptom check</div><div style={{ fontSize: 14, marginTop: 2 }}>The patient was shown: <strong style={{ fontWeight: 600 }}>If this is an emergency, call 911.</strong> Follow the clinic's emergency outreach procedure and mark reviewed once contact is made.</div></div>
            </div>
          )}
          {x.kind === "symptom" && x.status === "Reviewed" && <div style={{ background: T.wash, color: T.tealDk, borderRadius: 14, padding: "12px 14px", fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}><i className="ph ph-check-circle" />Reviewed{x.reviewedBy ? ` by ${x.reviewedBy}` : ""}{x.reviewedAt ? ` · ${x.reviewedAt}` : ""}</div>}
          {x.kind === "symptom" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><div style={{ fontSize: 12.5, fontWeight: 500, color: T.faint, marginBottom: 4 }}>Patient-provided description</div><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5 }}>{x.desc}</p></div>
              <div style={{ background: T.lavWash, borderRadius: 16, padding: "14px 16px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 14, color: T.lavInk }}>
                <span style={{ fontWeight: 500 }}>ALBA urgency</span><span>{x.urgency}</span>
                <span style={{ fontWeight: 500 }}>Recommended specialty</span><span>{x.specialty}</span>
                <span style={{ fontWeight: 500 }}>Emergency flag</span><span>{x.emergency ? "Yes" : "No"}</span>
              </div>
              {x.summary && <div><div style={{ fontSize: 12.5, fontWeight: 500, color: T.faint, marginBottom: 4 }}>ALBA summary shown to the person</div><p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: T.ink2 }}>{x.summary}</p></div>}
            </div>
          )}
          {x.kind === "alba" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(x.messages || []).length === 0 && <p style={{ margin: 0, color: T.ink2 }}>No messages were saved in this conversation.</p>}
              {(x.messages || []).map((m, i) => m.from === "patient"
                ? <div key={i} style={{ alignSelf: "flex-end", maxWidth: "82%", background: T.side, borderRadius: "18px 18px 6px 18px", padding: "10px 14px", fontSize: 14.5, whiteSpace: "pre-wrap" }}><div style={{ fontSize: 11.5, color: T.faint, marginBottom: 2 }}>{x.isVisitor ? "Visitor" : "Patient"}</div>{m.text}</div>
                : m.from === "alba"
                  ? <div key={i} style={{ alignSelf: "flex-start", maxWidth: "86%", display: "flex", gap: 8 }}><Orb size={22} style={{ marginTop: 4 }} /><div style={{ background: T.lavWash, color: T.ink, borderRadius: "18px 18px 18px 6px", padding: "10px 14px", fontSize: 14.5, whiteSpace: "pre-wrap" }}><div style={{ fontSize: 11.5, color: T.lavInk, fontWeight: 500, marginBottom: 2 }}>ALBA · AI</div>{m.text}</div></div>
                  : <div key={i} style={{ alignSelf: "center", fontSize: 12.5, color: T.lavInk, display: "flex", gap: 6, alignItems: "center", padding: "4px 10px", border: "1px dashed rgba(95,74,138,.3)", borderRadius: 999 }}><i className="ph ph-gear-six" />System · {m.text}</div>)}
            </div>
          )}
          {x.kind === "assessment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: T.lavWash, borderRadius: 16, padding: "14px 16px", color: T.lavInk }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>AI-generated summary</div><p style={{ margin: "4px 0 0", fontSize: 15, color: T.ink }}>{x.summary}</p></div>
              {!!x.focus?.length && <div><div style={{ fontSize: 12.5, fontWeight: 500, color: T.faint, marginBottom: 6 }}>Focus areas</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{x.focus.map((f) => <span key={f} style={{ height: 26, padding: "0 10px", borderRadius: 999, background: T.chip, color: T.tealDk, fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center" }}>{f}</span>)}</div></div>}
              {x.next && <div><div style={{ fontSize: 12.5, fontWeight: 500, color: T.faint, marginBottom: 4 }}>Suggested next step</div><div style={{ fontSize: 15 }}>{x.next}</div></div>}
              <div style={{ border: `1px solid ${T.line2}`, borderRadius: 16 }}>
                <button onClick={() => setAns(!ans)} aria-expanded={ans} style={{ display: "flex", width: "100%", alignItems: "center", gap: 8, padding: "12px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: T.ink }}><span style={{ flex: 1, textAlign: "left" }}>Patient answers</span><i className={ans ? "ph ph-caret-up" : "ph ph-caret-down"} /></button>
                {ans && <dl style={{ margin: 0, padding: "0 14px 14px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 14 }}>{(x.answers || []).map((q) => <React.Fragment key={q.q}><dt style={{ color: T.faint }}>{q.q}</dt><dd style={{ margin: 0 }}>{q.a}</dd></React.Fragment>)}</dl>}
              </div>
            </div>
          )}
          {x.kind === "lab" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><div style={{ fontSize: 12.5, fontWeight: 500, color: T.faint, marginBottom: 4 }}>Patient-provided information</div><p style={{ margin: 0, fontSize: 14.5 }}>{x.provided}</p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8 }}><tbody>{(x.results || []).map((r, i) => <tr key={i}><td style={{ padding: "8px 0", borderTop: `1px solid ${T.line}` }}>{r.t}</td><td style={{ padding: "8px 0", borderTop: `1px solid ${T.line}`, fontWeight: 500 }}>{r.v}</td><td style={{ padding: "8px 0", borderTop: `1px solid ${T.line}`, color: T.faint }}>Ref {r.r}</td></tr>)}</tbody></table>
              </div>
              <div style={{ background: T.lavWash, borderRadius: 16, padding: "14px 16px" }}><div style={{ fontSize: 12.5, fontWeight: 500, color: T.lavInk, display: "flex", gap: 6, alignItems: "center" }}><i className="ph ph-sparkle" />AI-generated explanation</div><p style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.55 }}>{x.explanation}</p></div>
            </div>
          )}
        </Body>}
        {x && <Foot>
          {x.whoId && <button onClick={openRec} className="h-sand" style={btn2}><i className="ph ph-arrow-up-right" />{x.isVisitor ? "Open visitor record" : "Open Patient 360"}</button>}
          <span style={{ flex: 1 }} />
          {x.kind === "symptom" && x.status === "New" && a.canEdit && <button onClick={() => a.act({ action: "ai.review", key: x.key }, { success: "Symptom check marked reviewed", sub: x.emergency ? "Removed from the emergency queue." : "", undoable: true, after: () => setVer((n) => n + 1) })} className="h-primary" style={btnP}><i className="ph ph-check" />Mark reviewed</button>}
        </Foot>}
      </div>
    </Sheet>
  );
}

// ── Referral detail sheet ────────────────────────────────────────────────
const NEXT: Record<string, [string, string]> = { Received: ["Reviewed", "Mark reviewed"], Reviewed: ["Scheduled", "Schedule visit"], Scheduled: ["Closed", "Close referral"], Closed: ["Received", "Reopen"] };

export function ReferralSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const a = useAdmin();
  const [r, setR] = useState<RefDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const first = React.useRef(true);
  useEffect(() => {
    getView<RefDTO>("referral", { id, ...(first.current ? { log: "1" } : {}) }).then(setR).catch((e) => setErr(e.message));
    first.current = false;
  }, [id, a.version]);
  const dl = { margin: 0, display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px 14px", fontSize: 14 } as React.CSSProperties;
  const dt = { color: T.faint };
  return (
    <Sheet onClose={onClose} label="Referral">
      <div data-screen-label="10 Referral Detail" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "22px 24px 14px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {r ? <>
              <div style={{ fontSize: 13, color: T.faint }}>Referral {r.code}</div>
              <h2 style={{ margin: "2px 0 6px", fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", display: "flex", gap: 8, alignItems: "center" }}>{r.patient}<TestTag show={r.test} /></h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Chip c={refUrg(r.urgency)} /><Chip c={refSt(r.status)} /></div>
            </> : <div style={{ fontSize: 14, color: T.ink2, paddingTop: 10 }}>{err || "Loading…"}</div>}
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        {r && <Body gap={18}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".05em", color: T.faint, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><i className="ph ph-file-text" />SOURCE INFORMATION</div>
            <dl style={dl}>
              <dt style={dt}>Patient phone</dt><dd style={{ margin: 0 }}>{r.phone}</dd>
              <dt style={dt}>Referring physician</dt><dd style={{ margin: 0 }}>{r.referring}</dd>
              <dt style={dt}>Physician phone</dt><dd style={{ margin: 0 }}>{r.referringPhone}</dd>
              <dt style={dt}>Physician address</dt><dd style={{ margin: 0 }}>{r.referringAddress}</dd>
              <dt style={dt}>How it arrived</dt><dd style={{ margin: 0 }}>{r.type}</dd>
              <dt style={dt}>Specialty</dt><dd style={{ margin: 0 }}>{r.specialty}</dd>
              <dt style={dt}>Requested physician</dt><dd style={{ margin: 0 }}>{r.requested}</dd>
              <dt style={dt}>Requested exams</dt><dd style={{ margin: 0 }}>{r.exams}</dd>
              <dt style={dt}>Clinical notes</dt><dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.notes}</dd>
              <dt style={dt}>Received</dt><dd style={{ margin: 0 }}>{r.received}</dd>
            </dl>
            {r.sourceText ? (
              <div style={{ marginTop: 12, borderRadius: 16, border: "1px dashed rgba(29,35,39,.18)", background: T.page, padding: "12px 14px", maxHeight: 220, overflowY: "auto" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.faint, marginBottom: 6, display: "flex", gap: 6, alignItems: "center" }}><i className="ph ph-scan" />Original text the form was filled from</div>
                <p style={{ margin: 0, fontSize: 13.5, color: T.ink2, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{r.sourceText}</p>
              </div>
            ) : (
              <div style={{ marginTop: 12, height: 90, borderRadius: 16, border: "1px dashed rgba(29,35,39,.18)", background: "repeating-linear-gradient(135deg,#F6F4F1 0 10px,#F3F0EC 10px 20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: T.ink2, fontSize: 13.5 }}><i className="ph ph-file-text" style={{ fontSize: 22 }} />Entered directly in the Referral Centre form</div>
            )}
          </div>
          <div style={{ background: T.page, borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".05em", color: T.tealDk, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><i className="ph ph-user-gear" />STAFF-ENTERED INFORMATION</div>
            <dl style={dl}>
              <dt style={dt}>Patient record</dt><dd style={{ margin: 0 }}>{r.pid ? <button onClick={() => { onClose(); a.go({ s: "patient", id: r.pid!, tab: "referrals" }); }} className="h-line" style={{ border: "none", background: "none", padding: 0, color: T.tealDk, cursor: "pointer", fontSize: 14 }}>{r.pid} ↗</button> : <span style={{ color: T.ink2 }}>Not linked to a patient record</span>}</dd>
              {r.visitorId && <><dt style={dt}>Sent by visitor</dt><dd style={{ margin: 0 }}><button onClick={() => { onClose(); a.go({ s: "visitor", id: r.visitorId! }); }} className="h-line" style={{ border: "none", background: "none", padding: 0, color: T.tealDk, cursor: "pointer", fontSize: 14 }}>{r.visitorId} ↗</button></dd></>}
              <dt style={dt}>Reviewer</dt><dd style={{ margin: 0 }}>{r.reviewer}</dd>
              <dt style={dt}>Scheduled</dt><dd style={{ margin: 0 }}>{r.scheduled}</dd>
              <dt style={dt}>Staff notes</dt><dd style={{ margin: 0 }}>{r.staffNote || "No staff notes yet."}</dd>
            </dl>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".05em", color: T.faint, marginBottom: 8 }}>STATUS HISTORY</div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>{r.history.map((h, i) => <li key={i} style={{ display: "flex", gap: 12, padding: "8px 0", alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: T.tealLt, flex: "none" }} /><span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{h.status}</span><span style={{ fontSize: 13, color: T.faint }}>{h.when} · {h.by}</span></li>)}</ol>
          </div>
        </Body>}
        {r && a.canEdit && (
          <Foot>
            <span style={{ flex: 1, fontSize: 13, color: T.faint }}>Status changes are logged</span>
            <button onClick={onClose} className="h-sand" style={btn2}>Close</button>
            <button onClick={() => moveReferral(a, r, NEXT[r.status][0])} className="h-primary" style={btnP}>{NEXT[r.status][1]}</button>
          </Foot>
        )}
      </div>
    </Sheet>
  );
}

// ── Audit event sheet ────────────────────────────────────────────────────
export function AuditSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const a = useAdmin();
  const [e, setE] = useState<AuditDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { getView<AuditDTO>("audit-item", { id }).then(setE).catch((x) => setErr(x.message)); }, [id]);
  const link = e?.subjectId && (e.subjectType === "patient" || e.subjectType === "visitor" || e.subjectType === "referral");
  return (
    <Sheet onClose={onClose} label="Audit event">
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "22px 24px 14px" }}>
          <div style={{ flex: 1 }}>{e ? <><div style={{ fontSize: 13, color: T.faint }}>Audit event · {e.id.slice(-8)}</div><h2 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>{e.action}</h2></> : <div style={{ fontSize: 14, color: T.ink2, paddingTop: 10 }}>{err || "Loading…"}</div>}</div>
          <CloseBtn onClose={onClose} />
        </div>
        {e && <Body gap={18}>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "130px 1fr", gap: "10px 14px", fontSize: 14.5 }}>
            <dt style={{ color: T.faint }}>Actor</dt><dd style={{ margin: 0 }}>{e.who} · {e.role}</dd>
            <dt style={{ color: T.faint }}>Timestamp</dt><dd style={{ margin: 0 }}>{e.ts} MT</dd>
            <dt style={{ color: T.faint }}>IP address</dt><dd style={{ margin: 0 }}>{e.ip}</dd>
            <dt style={{ color: T.faint }}>Type</dt><dd style={{ margin: 0 }}>{e.kind}</dd>
            <dt style={{ color: T.faint }}>Resource</dt><dd style={{ margin: 0 }}>{e.resource}</dd>
            <dt style={{ color: T.faint }}>Patient / visitor</dt><dd style={{ margin: 0 }}>{e.subject}</dd>
            <dt style={{ color: T.faint }}>Result</dt><dd style={{ margin: 0 }}><Chip c={e.result === "Success" ? chip("Success", "teal", "ph-check") : chip(e.result, "urgent", "ph-x")} /></dd>
          </dl>
          {e.reason && <div style={{ background: T.lavWash, borderRadius: 16, padding: "14px 16px" }}><div style={{ fontSize: 12.5, fontWeight: 500, color: T.lavInk }}>Reason for reveal</div><div style={{ fontSize: 15, marginTop: 2 }}>{e.reason}</div></div>}
          {(e.before || e.after) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ border: `1px solid ${T.line2}`, borderRadius: 16, padding: "12px 14px" }}><div style={{ fontSize: 12.5, color: T.faint }}>Before</div><div style={{ fontSize: 14.5, marginTop: 2 }}>{e.before || "—"}</div></div>
              <div style={{ border: `1px solid ${T.tealLt}`, borderRadius: 16, padding: "12px 14px", background: T.fresh }}><div style={{ fontSize: 12.5, color: T.tealDk }}>After</div><div style={{ fontSize: 14.5, marginTop: 2 }}>{e.after || "—"}</div></div>
            </div>
          )}
          <p style={{ margin: 0, fontSize: 13, color: T.faint }}>Audit entries are append-only and can't be edited or deleted.</p>
        </Body>}
        {e && link && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.line}` }}>
            <button onClick={() => { onClose(); if (e.subjectType === "referral") a.openRef(e.subjectId!); else a.go(e.subjectType === "visitor" ? { s: "visitor", id: e.subjectId!, tab: "audit" } : { s: "patient", id: e.subjectId!, tab: "audit" }); }} className="h-sand" style={btn2}><i className="ph ph-arrow-up-right" />{e.subjectType === "referral" ? "Open referral" : e.subjectType === "visitor" ? "Open visitor record" : "Open patient record"}</button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
