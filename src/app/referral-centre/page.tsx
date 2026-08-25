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

// Loads /logo.png and returns a base64 PNG + its natural aspect ratio,
// so the PDF logo scales correctly without distortion.
function loadLogo(url: string): Promise<{ dataUrl: string; ratio: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/png"), ratio: img.naturalWidth / img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
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
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      // ANRA brand palette (from tailwind.config.ts)
      const GOLD: [number, number, number] = [201, 162, 39];      // gold-500
      const GOLD_DARK: [number, number, number] = [158, 128, 31]; // gold-600
      const GOLD_LIGHT: [number, number, number] = [240, 225, 178]; // gold-200
      const GRAPHITE_900: [number, number, number] = [30, 28, 24];
      const GRAPHITE_700: [number, number, number] = [92, 86, 74];
      const GRAPHITE_500: [number, number, number] = [150, 141, 123];
      const PEARL_50: [number, number, number] = [247, 245, 240];
      const PEARL_300: [number, number, number] = [215, 205, 180];

      const drawCheckbox = (x: number, y: number, checked: boolean, size = 7) => {
        doc.setDrawColor(...GRAPHITE_500);
        doc.setLineWidth(0.75);
        if (checked) {
          doc.setFillColor(...GOLD);
          doc.rect(x, y, size, size, "FD");
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(x, y, size, size, "FD");
        }
      };

      // ---------- Header bar ----------
      doc.setFillColor(...GRAPHITE_900);
      doc.rect(0, 0, pageWidth, 68, "F");
      doc.setTextColor(...GOLD);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Referral", pageWidth / 2, 43, { align: "center" });

      // ---------- Locations + logo row (fixed column slots, no overlap) ----------
      const addrColWidth = 160;
      const logoSlotWidth = 120;
      const rowY = 88;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAPHITE_700);
      if (locations[0]) {
        doc.text(
          [locations[0].address, `T ${locations[0].phone}  F ${locations[0].fax}`],
          margin,
          rowY,
          { maxWidth: addrColWidth }
        );
      }
      if (locations[1]) {
        doc.text(
          [locations[1].address, `T ${locations[1].phone}  F ${locations[1].fax}`],
          pageWidth - margin,
          rowY,
          { align: "right", maxWidth: addrColWidth }
        );
      }

      const logo = await loadLogo("/logo.png");
      if (logo) {
        let logoH = 44;
        let logoW = logoH * logo.ratio;
        if (logoW > logoSlotWidth) {
          logoW = logoSlotWidth;
          logoH = logoW / logo.ratio;
        }
        doc.addImage(logo.dataUrl, "PNG", pageWidth / 2 - logoW / 2, 76, logoW, logoH);
      }

      // ---------- Patient / Referring boxes ----------
      const boxY = 158;
      const boxH = 100;
      const boxW = (pageWidth - margin * 2 - 20) / 2;
      const boxGap = 20;

      const drawInfoBox = (x: number, title: string, lines: string[]) => {
        doc.setFillColor(...PEARL_50);
        doc.setDrawColor(...PEARL_300);
        doc.setLineWidth(0.75);
        doc.roundedRect(x, boxY, boxW, boxH, 4, 4, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GOLD_DARK);
        doc.text(title, x + 14, boxY + 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...GRAPHITE_900);
        let ly = boxY + 42;
        lines.forEach((line) => {
          doc.text(line, x + 14, ly);
          ly += 16;
        });
      };

      drawInfoBox(margin, "PATIENT INFORMATION", [
        `Name: ${form.patientName || "—"}`,
        `Phone: ${form.patientPhone || "—"}`,
      ]);

      drawInfoBox(margin + boxW + boxGap, "REFERRING PHYSICIAN", [
        `Name: ${form.referringPhysician || "—"}`,
        `Phone: ${form.referringPhone || "—"}`,
        `Address: ${form.referringAddress || "—"}`,
      ]);
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAPHITE_500);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + boxW + boxGap + 14, boxY + 90);

      // ---------- Urgency ----------
      let y = boxY + boxH + 34;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...GRAPHITE_900);
      doc.text("Urgency", pageWidth / 2, y, { align: "center" });
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const urgencyGap = 100;
      const urgencyStartX = pageWidth / 2 - (URGENCY_OPTIONS.length * urgencyGap) / 2;
      URGENCY_OPTIONS.forEach((u, i) => {
        const x = urgencyStartX + i * urgencyGap;
        drawCheckbox(x, y - 6.5, form.urgency === u);
        doc.setTextColor(...GRAPHITE_900);
        doc.text(u, x + 13, y);
      });

      // ---------- Column headers ----------
      y += 34;
      const colGap = 20;
      const colW = (pageWidth - margin * 2 - colGap) / 2;
      const colLeftX = margin;
      const colRightX = margin + colW + colGap;
      const headerH = 22;

      doc.setFillColor(...GOLD);
      doc.rect(colLeftX, y, colW, headerH, "F");
      doc.rect(colRightX, y, colW, headerH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...GRAPHITE_900);
      doc.text("CONSULT", colLeftX + colW / 2, y + 15, { align: "center" });
      doc.text("CARDIAC DIAGNOSTIC EXAMINATION", colRightX + colW / 2, y + 15, { align: "center" });

      const listStartY = y + headerH + 20;
      const rowHeight = 13.5;

      // ---------- Left column: specialties, physicians, notes ----------
      let leftY = listStartY;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GRAPHITE_900);
      doc.text("Consultation Requested:", colLeftX, leftY);
      leftY += rowHeight;

      doc.setFont("helvetica", "normal");
      SPECIALTIES.forEach((s) => {
        drawCheckbox(colLeftX, leftY - 6.5, form.specialties.includes(s));
        doc.text(s, colLeftX + 13, leftY);
        leftY += rowHeight;
      });

      leftY += 8;
      physicians.forEach((p) => {
        drawCheckbox(colLeftX, leftY - 6.5, form.physicianSlugs.includes(p.slug));
        doc.text(p.name, colLeftX + 13, leftY);
        leftY += rowHeight;
      });

      leftY += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Clinical Notes:", colLeftX, leftY);
      leftY += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(form.clinicalNotes || "—", colW);
      doc.text(notesLines, colLeftX, leftY);

      // ---------- Right column: full diagnostic exam checklist ----------
      let rightY = listStartY;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const lineHeight = 10.5;
      DIAGNOSTIC_EXAMS.forEach((examName) => {
        const lines = doc.splitTextToSize(examName, colW - 16);
        drawCheckbox(colRightX, rightY - 6.5, form.exams.includes(examName));
        doc.setTextColor(...GRAPHITE_900);
        doc.text(lines, colRightX + 13, rightY);
        rightY += lineHeight * lines.length + 3;
      });

      // ---------- Footer bar ----------
      const footerH = 30;
      doc.setFillColor(...GRAPHITE_900);
      doc.rect(0, pageHeight - footerH, pageWidth, footerH, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GOLD_LIGHT);
      doc.text("Please fax completed form - we will call the patient to book", margin, pageHeight - footerH / 2 + 3);
      doc.text("www.anrahealth.ca", pageWidth - margin, pageHeight - footerH / 2 + 3, { align: "right" });

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