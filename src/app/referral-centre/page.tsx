"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, Loader2 } from "lucide-react";
import { physicians } from "@/data/physicians";
import { locations } from "@/data/content";

const SPECIALTIES = ["Cardiology", "Internal Medicine", "Endocrinology", "Geriatric Medicine"];

const DIAGNOSTIC_EXAMS = [
  "Exercise MPI", "Pharmacological MPI", "Bubble Echocardiogram", "Echocardiogram",
  "Carotid Ultrasound", "Exercise Stress Test", "Stress Echocardiogram",
  "24 Hour Holter Monitor", "48 Hour Holter Monitor", "5 Day Holter Monitor",
  "ECG - Electrocardiogram", "24 Hour BP Monitor", "ABI (Ankle Brachial Index)",
  "Abnormal ECG", "CAD / CHF", "Post PCI", "F/U Known Stable CAD",
  "Abnormal Treadmill Stress Test", "Functional Significance Coronary Stenosis",
  "Murmur", "Chest Pain", "Shortness of Breath", "Palpitations / Arrhythmias",
  "Edema / PND / Orthopnea", "Hypertension / Left Ventricular Hypertrophy",
  "Pulmonary Hypertension", "Cardiovascular Risk Assessment",
  "Syncope / Presyncope / Vertigo / Dizziness", "Stroke / TIA", "Carotid Bruit",
  "Follow-up of Known Carotid Stenosis", "Post-surgical Angiographic Intervention Follow-up",
];

const URGENCY_OPTIONS = ["ASAP", "Urgent", "Semi-Urgent", "Phone Consult"];

interface FormState {
  patientName: string;
  patientPhone: string;
  referringPhysician: string;
  referringPhone: string;
  referringAddress: string;
  urgency: string;
  specialties: string[];
  physicianSlugs: string[];
  exams: string[];
  clinicalNotes: string;
}

const EMPTY_FORM: FormState = {
  patientName: "", patientPhone: "", referringPhysician: "", referringPhone: "",
  referringAddress: "", urgency: "ASAP", specialties: [], physicianSlugs: [],
  exams: [], clinicalNotes: "",
};

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function ReferralCentre() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [freeText, setFreeText] = useState("");
  const [autofilling, setAutofilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAutofill = async () => {
    if (freeText.trim().length < 10) return;
    setAutofilling(true);
    setError(null);
    try {
      const res = await fetch("/api/referral-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: freeText }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setForm((f) => ({
        ...f,
        patientName: data.patientName || f.patientName,
        urgency: data.urgency || f.urgency,
        specialties: Array.isArray(data.specialties) ? data.specialties.filter((s: string) => SPECIALTIES.includes(s)) : f.specialties,
        exams: Array.isArray(data.exams) ? data.exams.filter((e: string) => DIAGNOSTIC_EXAMS.includes(e)) : f.exams,
        clinicalNotes: data.clinicalNotes || f.clinicalNotes,
      }));
    } catch {
      setError("Auto-fill failed. Please fill the form manually below.");
    } finally {
      setAutofilling(false);
    }
  };

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(59, 126, 161);
      doc.rect(0, 0, pageWidth, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("Referral", pageWidth / 2, 38, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      locations.forEach((l, i) => {
        const x = i === 0 ? 40 : pageWidth - 40;
        const align = i === 0 ? "left" : "right";
        doc.text([l.address, `T ${l.phone}  F ${l.fax}`], x, 90, { align: align as any });
      });

      let y = 130;
      doc.setFontSize(11);
      doc.setTextColor(59, 126, 161);
      doc.text("PATIENT INFORMATION", 40, y);
      doc.text("REFERRING PHYSICIAN", pageWidth / 2 + 20, y);
      y += 20;
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`Name: ${form.patientName || "—"}`, 40, y);
      doc.text(`Name: ${form.referringPhysician || "—"}`, pageWidth / 2 + 20, y);
      y += 16;
      doc.text(`Phone: ${form.patientPhone || "—"}`, 40, y);
      doc.text(`Phone: ${form.referringPhone || "—"}`, pageWidth / 2 + 20, y);
      y += 16;
      doc.text(`Address: ${form.referringAddress || "—"}`, pageWidth / 2 + 20, y);
      y += 16;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2 + 20, y);

      y += 40;
      doc.setFontSize(11);
      doc.setTextColor(59, 126, 161);
      doc.text("Urgency", pageWidth / 2, y, { align: "center" });
      y += 18;
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      const urgencyLine = URGENCY_OPTIONS.map((u) => `${form.urgency === u ? "[X]" : "[ ]"} ${u}`).join("    ");
      doc.text(urgencyLine, pageWidth / 2, y, { align: "center" });

      y += 30;
      doc.setFontSize(11);
      doc.setTextColor(59, 126, 161);
      doc.text("CONSULTATION REQUESTED", 40, y);
      y += 18;
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      SPECIALTIES.forEach((s) => {
        doc.text(`${form.specialties.includes(s) ? "[X]" : "[ ]"} ${s}`, 40, y);
        y += 14;
      });
      const selectedPhysicians = physicians.filter((p) => form.physicianSlugs.includes(p.slug));
      selectedPhysicians.forEach((p) => {
        doc.text(`[X] ${p.name}`, 40, y);
        y += 14;
      });

      let colY = 130 + 20 + 16 + 16 + 16 + 16 + 40 + 18 + 18 + 20;
      doc.setFontSize(11);
      doc.setTextColor(59, 126, 161);
      doc.text("DIAGNOSTIC EXAMINATION", pageWidth / 2 + 20, colY - 20);
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      form.exams.forEach((e) => {
        doc.text(`[X] ${e}`, pageWidth / 2 + 20, colY);
        colY += 14;
      });

      const notesY = Math.max(y, colY) + 30;
      doc.setFontSize(11);
      doc.setTextColor(59, 126, 161);
      doc.text("Clinical Notes:", 40, notesY);
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(form.clinicalNotes || "—", 40, notesY + 18, { maxWidth: pageWidth - 80 });

      doc.save(`ANRA-Referral-${form.patientName || "patient"}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ background: "linear-gradient(160deg, #faf8f3 0%, #f2ede0 45%, #ece2cd 100%)", minHeight: "100vh" }}>
      <div className="px-6 pt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2">
          <ArrowLeft size={14} /> Back to Main Page
        </Link>
      </div>

      <div className="text-center pt-10 pb-8 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-graphite-900">Referral Centre</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {/* Automatic referral — AI pre-fill from free text */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-gold-600" />
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Automatic Referral</p>
          </div>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
            placeholder="Describe the patient and reason for referral in plain text — e.g. 'Chuks, chest pain for two weeks, needs urgent cardiology consult and an ECG.'"
            className="w-full px-4 py-3 rounded-xl border border-pearl-300 text-sm bg-white outline-none focus:ring-2 focus:ring-gold-500 resize-none mb-3"
          />
          <button
            onClick={runAutofill}
            disabled={freeText.trim().length < 10 || autofilling}
            className="gold-gloss px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
          >
            {autofilling ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {autofilling ? "Filling form…" : "Auto-fill form below"}
          </button>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        {/* Manual referral form */}
        <div className="glass rounded-3xl p-6 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Manual Referral</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="Patient Name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="px-4 py-2.5 rounded-xl border border-pearl-300 text-sm outline-none focus:ring-2 focus:ring-gold-500" />
            <input placeholder="Patient Phone" value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} className="px-4 py-2.5 rounded-xl border border-pearl-300 text-sm outline-none focus:ring-2 focus:ring-gold-500" />
            <input placeholder="Referring Physician Name" value={form.referringPhysician} onChange={(e) => setForm({ ...form, referringPhysician: e.target.value })} className="px-4 py-2.5 rounded-xl border border-pearl-300 text-sm outline-none focus:ring-2 focus:ring-gold-500" />
            <input placeholder="Referring Physician Phone" value={form.referringPhone} onChange={(e) => setForm({ ...form, referringPhone: e.target.value })} className="px-4 py-2.5 rounded-xl border border-pearl-300 text-sm outline-none focus:ring-2 focus:ring-gold-500" />
            <input placeholder="Referring Physician Address" value={form.referringAddress} onChange={(e) => setForm({ ...form, referringAddress: e.target.value })} className="px-4 py-2.5 rounded-xl border border-pearl-300 text-sm outline-none focus:ring-2 focus:ring-gold-500 sm:col-span-2" />
          </div>

          <div>
            <p className="text-xs font-semibold text-graphite-500 mb-2">Urgency</p>
            <div className="flex flex-wrap gap-2">
              {URGENCY_OPTIONS.map((u) => (
                <button key={u} onClick={() => setForm({ ...form, urgency: u })} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${form.urgency === u ? "gold-gloss" : "border border-pearl-300 text-graphite-600"}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-graphite-500 mb-2">Consultation Requested — Specialty</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => setForm({ ...form, specialties: toggle(form.specialties, s) })} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${form.specialties.includes(s) ? "gold-gloss" : "border border-pearl-300 text-graphite-600"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-graphite-500 mb-2">Consultation Requested — Physician</p>
            <div className="flex flex-wrap gap-2">
              {physicians.map((p) => (
                <button key={p.slug} onClick={() => setForm({ ...form, physicianSlugs: toggle(form.physicianSlugs, p.slug) })} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${form.physicianSlugs.includes(p.slug) ? "gold-gloss" : "border border-pearl-300 text-graphite-600"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-graphite-500 mb-2">Diagnostic Examination</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {DIAGNOSTIC_EXAMS.map((e) => (
                <button key={e} onClick={() => setForm({ ...form, exams: toggle(form.exams, e) })} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${form.exams.includes(e) ? "gold-gloss" : "border border-pearl-300 text-graphite-600"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Clinical notes…"
            value={form.clinicalNotes}
            onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-pearl-300 text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none"
          />

          <button
            onClick={generatePdf}
            disabled={generating || !form.patientName}
            className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {generating ? "Generating…" : "Download Referral PDF"}
          </button>
          <p className="text-xs text-graphite-400">Email/fax sending isn't configured yet — download and send the PDF manually for now.</p>
        </div>
      </div>
    </div>
  );
}