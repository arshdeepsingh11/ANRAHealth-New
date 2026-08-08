"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Sparkles, Download, FileCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import { locations, brand } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

const CONSULTATION_OPTIONS = ["Cardiology", "Internal Medicine", "Endocrinology", "Geriatric Medicine"];

const PHYSICIAN_OPTIONS = [
  "Dr. Ravi Varshney",
  "Dr. Anmol Kapoor",
  "Dr. Alvin Villanueva",
  "Dr. Ali Debek",
  "Dr. Lovpreet Mangat",
  "Dr. Faisal Hasan",
];

const URGENCY_OPTIONS = ["ASAP", "Urgent", "Semi-Urgent", "Phone Consult"];

const TEST_OPTIONS = [
  "Exercise MPI",
  "Pharmacological MPI",
  "Bubble Echocardiogram",
  "Echocardiogram",
  "Carotid ultrasound",
  "Exercise Stress Test",
  "Stress Echocardiogram",
  "24 Hour Holter Monitor",
  "48 Hour Holter Monitor",
  "5 day Holter Monitor",
  "ECG - Electrocardiogram",
  "24 hour BP Monitor",
  "ABI (Ankle Brachial Index)",
];

const INDICATION_OPTIONS = [
  "Abnormal ECG",
  "CAD / CHF",
  "Post PCI",
  "F/U Known Stable CAD",
  "Abnormal Treadmill Stress Test",
  "Functional Significance Coronary Stenosis",
  "Murmur",
  "Chest Pain",
  "Shortness of breath",
  "Palpitations / Arrhythmias",
  "Edema / PND / Orthopnea",
  "Hypertension / Left ventricular Hypertrophy",
  "Pulmonary Hypertension",
  "Cardiovascular risk assessment",
  "Syncope / Presyncope / Vertigo / Dizziness",
  "Stroke / TIA",
  "Carotid Bruit",
  "Follow-up of known carotid stenosis",
  "Post-surgical angiographic intervention follow-up",
];

const emptyForm = {
  patientName: "",
  patientPhone: "",
  isSelfReferral: false,
  referringPhysicianName: "",
  referringPhysicianPhone: "",
  referringPhysicianAddress: "",
  urgency: "",
  consultationRequested: [] as string[],
  requestedPhysician: "",
  diagnosticTests: [] as string[],
  indications: [] as string[],
  clinicalNotes: "",
};

function toggleInArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function CheckboxGroup({ label, options, selected, onToggle, columns = 1 }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void; columns?: number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-inksoft mb-2">{label}</p>
      <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((opt) => (
          <label key={opt} className="flex items-start gap-2 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="mt-0.5 accent-blue"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function ReferralAssistant({ t }: { t: (k: string) => string }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const generate = async () => {
    if (description.trim().length < 3) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setForm({ ...emptyForm, ...data });
      setSubmitted(false);
    } catch (err) {
      setError("Something went wrong generating the referral. Please try again, or fill the form manually below.");
    } finally {
      setLoading(false);
    }
  };

  const startBlank = () => {
    setForm({ ...emptyForm });
    setSubmitted(false);
  };

  const updateField = (key: string, value: any) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSubmit = () => {
    // TODO: Replace with a real backend endpoint (Formspree / EmailJS / your own API)
    // to actually deliver this referral, matching how the main contact form is wired.
    setSubmitted(true);
  };

  const downloadPdf = async () => {
    if (!form) return;
    const { jsPDF } = await import("jspdf");

    // Logo is served from /public in Next.js (was a Vite asset import before) —
    // fetch it the same way to turn it into a data URL jsPDF can embed.
    const logoDataUrl = await fetch("/logo.png")
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const blue: [number, number, number] = [59, 126, 161];
    const lightBlue: [number, number, number] = [234, 243, 247];
    const dark: [number, number, number] = [44, 62, 80];
    const gray: [number, number, number] = [110, 120, 130];

    const checkbox = (x: number, y: number, checked: boolean, size = 9) => {
      doc.setDrawColor(...gray);
      doc.setLineWidth(0.7);
      doc.rect(x, y, size, size);
      if (checked) {
        doc.setFillColor(...blue);
        doc.rect(x + 1.3, y + 1.3, size - 2.6, size - 2.6, "F");
      }
    };

    const sectionHeaderBar = (x: number, y: number, w: number, label: string) => {
      doc.setFillColor(...blue);
      doc.rect(x, y, w, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined as any, "bold");
      doc.setFontSize(10);
      doc.text(label.toUpperCase(), x + w / 2, y + 14, { align: "center" });
      doc.setTextColor(...dark);
    };

    // ---- Header bar with logo ----
    doc.setFillColor(...blue);
    doc.rect(0, 0, pageWidth, 60, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined as any, "bold");
    doc.setFontSize(18);
    doc.text("Referral", pageWidth / 2, 37, { align: "center" });

    // Logo, centered just below header bar
    const logoW = 130;
    const logoH = 65;
    doc.addImage(logoDataUrl, "PNG", (pageWidth - logoW) / 2, 68, logoW, logoH);

    // Location blocks flanking the logo
    doc.setTextColor(...dark);
    doc.setFont(undefined as any, "normal");
    doc.setFontSize(8);
    doc.text("250, 8500 Blackfoot Trail SE", margin, 78);
    doc.text("Calgary, AB T1Y 0B4", margin, 89);
    doc.text("T 403.879.7911  F 403.879.7899", margin, 100);

    doc.text("201, 3151 27th Street NE", pageWidth - margin, 78, { align: "right" });
    doc.text("Calgary, AB T1Y 0B4", pageWidth - margin, 89, { align: "right" });
    doc.text("T 403.235.4109  F 403.235.4147", pageWidth - margin, 100, { align: "right" });

    let y = 150;

    // ---- Patient Info + Referring Physician boxed panels ----
    const panelW = (pageWidth - margin * 2 - 16) / 2;
    const panelH = 90;

    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...blue);
    doc.roundedRect(margin, y, panelW, panelH, 4, 4, "FD");
    doc.roundedRect(margin + panelW + 16, y, panelW, panelH, 4, 4, "FD");

    doc.setFont(undefined as any, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...blue);
    doc.text("PATIENT INFORMATION", margin + 12, y + 18);
    doc.text("REFERRING PHYSICIAN", margin + panelW + 28, y + 18);

    doc.setFont(undefined as any, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    doc.text(`Name: ${form.patientName || "___________________"}`, margin + 12, y + 38);
    doc.text(`Phone: ${form.patientPhone || "___________________"}`, margin + 12, y + 54);

    const physCol = margin + panelW + 28;
    doc.text(
      `Name: ${form.isSelfReferral ? "Self-referral" : form.referringPhysicianName || "___________________"}`,
      physCol,
      y + 34
    );
    if (!form.isSelfReferral) {
      doc.text(`Phone: ${form.referringPhysicianPhone || "___________________"}`, physCol, y + 48);
      const addrLines = doc.splitTextToSize(`Address: ${form.referringPhysicianAddress || "___________________"}`, panelW - 24);
      doc.text(addrLines, physCol, y + 62);
    }
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, physCol, y + panelH - 8);

    y += panelH + 24;

    // ---- Urgency row ----
    doc.setFont(undefined as any, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Urgency", pageWidth / 2, y, { align: "center" });
    y += 14;
    doc.setFont(undefined as any, "normal");
    doc.setFontSize(9.5);
    let ux = margin + 30;
    URGENCY_OPTIONS.forEach((u) => {
      checkbox(ux, y - 8, form.urgency === u);
      doc.text(u, ux + 14, y);
      ux += doc.getTextWidth(u) + 45;
    });

    y += 26;

    // ---- Three-column body: Consult | Diagnostic Tests | Indications ----
    const colGap = 14;
    const col1X = margin;
    const col1W = 150;
    const col2X = col1X + col1W + colGap;
    const col2W = 165;
    const col3X = col2X + col2W + colGap;
    const col3W = pageWidth - margin - col3X;

    sectionHeaderBar(col1X, y, col1W, "Consult");
    sectionHeaderBar(col2X, y, col2W + colGap + col3W, "Cardiac Diagnostic Examination");

    let colY1 = y + 34;
    let colY2 = y + 34;
    let colY3 = y + 34;

    doc.setFontSize(8.5);
    doc.setFont(undefined as any, "bold");
    doc.text("Consultation Requested:", col1X, colY1);
    colY1 += 12;
    doc.setFont(undefined as any, "normal");
    CONSULTATION_OPTIONS.forEach((c) => {
      checkbox(col1X, colY1 - 8, form.consultationRequested.includes(c), 8);
      doc.text(c, col1X + 12, colY1);
      colY1 += 13;
    });
    colY1 += 8;
    PHYSICIAN_OPTIONS.forEach((p) => {
      checkbox(col1X, colY1 - 8, form.requestedPhysician === p, 8);
      const lines = doc.splitTextToSize(p, col1W - 14);
      doc.text(lines, col1X + 12, colY1);
      colY1 += 12 * lines.length + 1;
    });
    colY1 += 10;
    doc.setFont(undefined as any, "bold");
    doc.text("Clinical Notes:", col1X, colY1);
    colY1 += 12;
    doc.setFont(undefined as any, "normal");
    const notesLines = doc.splitTextToSize(form.clinicalNotes || "-", col1W);
    doc.text(notesLines, col1X, colY1);

    doc.setFont(undefined as any, "normal");
    TEST_OPTIONS.forEach((t) => {
      checkbox(col2X, colY2 - 8, form.diagnosticTests.includes(t), 8);
      const lines = doc.splitTextToSize(t, col2W - 14);
      doc.text(lines, col2X + 12, colY2);
      colY2 += 12 * lines.length + 1;
    });

    doc.setFont(undefined as any, "normal");
    INDICATION_OPTIONS.forEach((ind) => {
      checkbox(col3X, colY3 - 8, form.indications.includes(ind), 8);
      const lines = doc.splitTextToSize(ind, col3W - 14);
      doc.text(lines, col3X + 12, colY3);
      colY3 += 11.5 * lines.length + 1;
    });

    // ---- Footer bar ----
    doc.setFillColor(...blue);
    doc.rect(0, pageHeight - 26, pageWidth, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont(undefined as any, "normal");
    doc.text("Please fax completed form - we will call the patient to book", margin, pageHeight - 11);
    doc.text("www.anrahealth.ca", pageWidth - margin, pageHeight - 11, { align: "right" });

    doc.save(`ANRA-Referral-${(form.patientName || "patient").replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8" style={{ boxShadow: "0 10px 32px rgba(44,62,80,0.08)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-coral" />
        <p className="text-sm font-semibold tracking-wide uppercase text-coral">{t("contact.aiReferral")}</p>
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-2">{t("contact.describeSituation")}</h2>
      <p className="text-sm text-inksoft mb-6">
        {t("contact.aiSubtitle")}
      </p>

      {!form && (
        <>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Referring my patient John Smith, 58, for chest pain and shortness of breath on exertion. Suspect CAD. Please see urgently. Reachable at 403-555-0102..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-line text-sm bg-bgalt focus:outline-none focus:ring-2 focus:ring-blue resize-none mb-4"
          />
          {error && <p className="text-sm text-coral mb-4">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generate}
              disabled={description.trim().length < 3 || loading}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              {loading ? t("contact.generating") : t("contact.generateReferral")}
            </button>
            <button
              onClick={startBlank}
              className="px-5 py-3 rounded-full text-sm font-semibold border border-line text-inksoft hover:bg-bgalt"
            >
              {t("contact.fillManually")}
            </button>
          </div>
        </>
      )}

      {form && !submitted && (
        <div className="space-y-8 pt-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue">{t("contact.reviewEdit")}</p>
            <button onClick={() => setForm(null)} className="text-xs font-semibold text-inksoft hover:text-ink">
              {t("contact.startOver")}
            </button>
          </div>

          {/* Patient Information */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t("contact.patientInfo")}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                value={form.patientName}
                onChange={(e) => updateField("patientName", e.target.value)}
                placeholder={t("contact.patientName")}
                className="px-4 py-2.5 rounded-lg border border-line text-sm outline-none focus:border-blue"
              />
              <input
                value={form.patientPhone}
                onChange={(e) => updateField("patientPhone", e.target.value)}
                placeholder={t("contact.patientPhone")}
                className="px-4 py-2.5 rounded-lg border border-line text-sm outline-none focus:border-blue"
              />
            </div>
          </div>

          {/* Referring Physician */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">{t("contact.referringPhysician")}</h3>
              <label className="flex items-center gap-2 text-xs text-inksoft cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSelfReferral}
                  onChange={(e) => updateField("isSelfReferral", e.target.checked)}
                  className="accent-blue"
                />
                {t("contact.selfReferral")}
              </label>
            </div>
            {!form.isSelfReferral && (
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  value={form.referringPhysicianName}
                  onChange={(e) => updateField("referringPhysicianName", e.target.value)}
                  placeholder={t("contact.referringName")}
                  className="px-4 py-2.5 rounded-lg border border-line text-sm outline-none focus:border-blue"
                />
                <input
                  value={form.referringPhysicianPhone}
                  onChange={(e) => updateField("referringPhysicianPhone", e.target.value)}
                  placeholder={t("contact.physicianPhone")}
                  className="px-4 py-2.5 rounded-lg border border-line text-sm outline-none focus:border-blue"
                />
                <input
                  value={form.referringPhysicianAddress}
                  onChange={(e) => updateField("referringPhysicianAddress", e.target.value)}
                  placeholder={t("contact.physicianAddress")}
                  className="sm:col-span-2 px-4 py-2.5 rounded-lg border border-line text-sm outline-none focus:border-blue"
                />
              </div>
            )}
          </div>

          {/* Urgency */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t("contact.urgency")}</h3>
            <div className="flex flex-wrap gap-4">
              {URGENCY_OPTIONS.map((u) => (
                <label key={u} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    checked={form.urgency === u}
                    onChange={() => updateField("urgency", u)}
                    className="accent-blue"
                  />
                  {u}
                </label>
              ))}
            </div>
          </div>

          {/* Consultation Requested */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t("contact.consultationRequested")}</h3>
            <CheckboxGroup
              label={t("contact.consultationRequested")}
              options={CONSULTATION_OPTIONS}
              selected={form.consultationRequested}
              onToggle={(v) => updateField("consultationRequested", toggleInArray(form.consultationRequested, v))}
              columns={2}
            />
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-inksoft mb-2">{t("contact.preferredPhysician")}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {PHYSICIAN_OPTIONS.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="physician"
                      checked={form.requestedPhysician === p}
                      onChange={() => updateField("requestedPhysician", p)}
                      className="accent-blue"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic Tests */}
          <CheckboxGroup
            label={t("contact.diagnosticExam")}
            options={TEST_OPTIONS}
            selected={form.diagnosticTests}
            onToggle={(v) => updateField("diagnosticTests", toggleInArray(form.diagnosticTests, v))}
            columns={2}
          />

          {/* Indications */}
          <CheckboxGroup
            label={t("contact.indications")}
            options={INDICATION_OPTIONS}
            selected={form.indications}
            onToggle={(v) => updateField("indications", toggleInArray(form.indications, v))}
            columns={2}
          />

          {/* Clinical Notes */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t("contact.clinicalNotes")}</h3>
            <textarea
              value={form.clinicalNotes}
              onChange={(e) => updateField("clinicalNotes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-line text-sm outline-none focus:border-blue resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105"
            >
              {t("contact.submitReferral")} <Send size={15} />
            </button>
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-line text-ink hover:bg-bgalt"
            >
              {t("contact.downloadPdf")} <Download size={15} />
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="flex items-start gap-3 p-5 rounded-2xl bg-bgalt">
          <FileCheck size={22} className="text-blue shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink mb-1">{t("contact.referralReceived")}</p>
            <p className="text-sm text-inksoft">
              {t("contact.referralReceivedDesc")}
            </p>
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-blue"
            >
              {t("contact.downloadPdf")} <Download size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { t, lang } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace this with a real Formspree / EmailJS endpoint before deploying.
    setSent(true);
  };

  return (
    <>
      <section className="pt-16 pb-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("contact.getInTouch")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5">{t("contact.heading")}</h1>
            <p className="text-base md:text-lg text-inksoft">
              {t("contact.subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10">
        {/* AI Referral Assistant — now above the location cards */}
        <div className="max-w-3xl mx-auto mb-14">
          <Reveal>
            <ReferralAssistant t={t} />
          </Reveal>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 mb-14">
          {locations.map((loc, i) => (
            <Reveal key={loc.name} delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-8 h-full" style={{ boxShadow: "0 8px 24px rgba(44,62,80,0.08)" }}>
                <p className="text-xs font-semibold tracking-wide uppercase mb-2 text-blue">{tc(lang, "locations", loc.tag, "tag", loc.tag)}</p>
                <h3 className="text-xl font-bold mb-4">{tc(lang, "locations", loc.tag, "name", loc.name)}</h3>
                <div className="space-y-2.5 text-sm text-inksoft mb-5">
                  <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> {loc.address}</p>
                  <p className="flex items-center gap-2"><Phone size={15} className="shrink-0" /> {loc.phone}</p>
                  <p className="flex items-center gap-2"><Clock size={15} className="shrink-0" /> {brand.hours}</p>
                </div>
                <iframe
                  title={loc.name}
                  className="w-full h-48 rounded-xl border-0"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(loc.address)}&output=embed`}
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="max-w-2xl mx-auto bg-white rounded-2xl p-8" style={{ boxShadow: "0 8px 24px rgba(44,62,80,0.08)" }}>
          <h2 className="text-xl font-bold mb-6">{t("contact.sendMessage")}</h2>
          {sent ? (
            <p className="text-sm text-inksoft">{t("contact.thanksMessage")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder={t("contact.fullName")} className="px-4 py-3 rounded-lg border border-line text-sm outline-none focus:border-blue" />
                <input required type="tel" placeholder={t("contact.phoneNumber")} className="px-4 py-3 rounded-lg border border-line text-sm outline-none focus:border-blue" />
              </div>
              <input required type="email" placeholder={t("contact.email")} className="px-4 py-3 rounded-lg border border-line text-sm outline-none focus:border-blue" />
              <textarea required rows={4} placeholder={t("contact.howCanWeHelp")} className="px-4 py-3 rounded-lg border border-line text-sm outline-none focus:border-blue resize-none" />
              <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
                {t("contact.send")} <Send size={15} />
              </button>
            </form>
          )}
        </Reveal>
      </section>
    </>
  );
}
