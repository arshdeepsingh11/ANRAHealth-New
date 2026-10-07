// Patient-added health records: Neyu reads the original file (PDF or photo)
// into structured facts + a plain-language explanation. The original is kept
// untouched; the reading is always labelled as Neyu's (AI).
import { prisma } from "./db";
import { geminiJSON, unsafeAiText } from "./ai";

export const DOC_KINDS = ["lab", "imaging", "ecg", "cardiology", "specialist", "discharge", "prescription", "visit", "other"] as const;
export const DOC_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_DOC_BYTES = 15 * 1024 * 1024;

export interface DocValue { name: string; value: string; unit?: string; ref?: string; flag?: string }
export interface DocReading { title?: string; kind?: string; provider?: string | null; date?: string | null; values: DocValue[]; keyPoints: string[]; summary?: string; aiFailed?: boolean }

const SYSTEM = `You read medical documents for a patient's personal health record (Canada).
Extract facts exactly as printed. Do not guess values that are not on the page. Never diagnose, never recommend treatment or medication changes.
Return JSON only:
{"title": short name of the report (e.g. "Lipid panel", "Chest X-ray report", "12-lead ECG"),
 "kind": one of lab|imaging|ecg|cardiology|specialist|discharge|prescription|visit|other,
 "provider": laboratory, clinic or hospital name printed on it, or null,
 "date": collection / exam / visit date as YYYY-MM-DD, or null,
 "values": [{"name": test name, "value": result exactly as written, "unit": unit or "", "ref": reference range as written or "", "flag": "high"|"low"|"abnormal"|"normal"|"" only as marked on the report}] (lab-style results only, max 40),
 "keyPoints": 2-6 short factual statements copied or closely paraphrased from the report (findings, impressions, medications listed),
 "summary": 2-4 calm plain-language sentences for the patient explaining what this report is and what it shows. No diagnosis. If something is flagged, say it is worth discussing with their healthcare professional.}
If the file is not a medical document, use kind "other" and say so in the summary.`;

// Gemini accepts up to ~20 MB per request; base64 adds a third, so files above
// this size are stored but read manually.
export const MAX_AI_BYTES = 14 * 1024 * 1024;

/** Page count of the original (PDF pages; an image is 1 page). */
export async function countPages(buf: Buffer, mime: string): Promise<number> {
  if (mime !== "application/pdf") return 1;
  try { const { PDFDocument } = await import("pdf-lib"); return (await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false })).getPageCount(); }
  catch { const m = buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g); return m ? m.length : 1; }
}

/** Neyu Reader: original file → structured facts + plain-language summary. */
export async function readDocument(buf: Buffer, mime: string): Promise<DocReading> {
  if (buf.length > MAX_AI_BYTES) return { values: [], keyPoints: [], aiFailed: true };
  const r = await geminiJSON<DocReading>(SYSTEM, [{ text: "Read this health document." }, { inline_data: { mime_type: mime, data: buf.toString("base64") } }], { label: "reader", timeoutMs: 90_000 });
  if (!r) return { values: [], keyPoints: [], aiFailed: true };
  const clean = (s: unknown, n = 200) => (typeof s === "string" ? s.trim().slice(0, n) : "");
  const summary = clean(r.summary, 900);
  return {
    title: clean(r.title, 120) || undefined,
    kind: DOC_KINDS.includes(r.kind as any) ? r.kind : "other",
    provider: clean(r.provider, 120) || null,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(r.date || "")) ? r.date : null,
    values: (Array.isArray(r.values) ? r.values : []).slice(0, 40).map((v: any) => ({ name: clean(v?.name, 80), value: clean(v?.value, 40), unit: clean(v?.unit, 20), ref: clean(v?.ref, 40), flag: clean(v?.flag, 12).toLowerCase() })).filter((v) => v.name && v.value),
    keyPoints: (Array.isArray(r.keyPoints) ? r.keyPoints : []).map((k: unknown) => clean(k, 220)).filter(Boolean).slice(0, 6),
    summary: summary && !unsafeAiText(summary) ? summary : summary ? "Neyu read this report. Please review the original and discuss anything you're unsure about with your healthcare professional." : undefined,
  };
}

const CAT = (n: string) => /ldl|hdl|cholesterol|triglycer|apo|lp\(a\)|lipoprotein|troponin|bnp/i.test(n) ? "Heart Health" : /glucose|a1c|insulin|creatinine|egfr|alt|ast|urea|sodium|potassium/i.test(n) ? "Metabolic Health" : /crp|esr|white|wbc/i.test(n) ? "Inflammation" : /vitamin|ferritin|iron|b12|folate|magnesium|zinc/i.test(n) ? "Nutrition" : /tsh|t4|t3|testosterone|estradiol|cortisol/i.test(n) ? "Hormones" : "Other";
// Common tests map to the same codes the clinic uses, so trends join up across providers.
const STD: [RegExp, string][] = [[/^ldl|ldl[- ]?c|low[- ]density/i, "ldl"], [/^hdl|high[- ]density/i, "hdl"], [/a1c|glycated|glycosylated/i, "hba1c"], [/triglycer/i, "trig"], [/^total cholesterol|^cholesterol,? total|^cholesterol$/i, "chol"], [/non[- ]?hdl/i, "nonhdl"], [/vitamin d|25[- ]?oh/i, "vitd"], [/fasting glucose|^glucose/i, "glucose"], [/^tsh|thyroid stimulating/i, "tsh"], [/troponin/i, "hs-troponin-t"], [/^crp|c[- ]reactive/i, "crp"], [/creatinine/i, "creatinine"], [/egfr/i, "egfr"], [/ferritin/i, "ferritin"], [/b12|cobalamin/i, "b12"], [/apo ?b|apolipoprotein b/i, "apob"], [/lp\(a\)|lipoprotein\s*\(?a/i, "lpa"]];
const slug = (n: string) => STD.find(([re]) => re.test(n.trim()))?.[1] || n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/** Confirmed lab values become part of Results + Trends (source = the provider). */
export async function saveLabValues(patientId: string, docId: string, provider: string | null, date: Date | null, title: string, values: DocValue[]) {
  await prisma.labResult.deleteMany({ where: { patientId, documentId: docId } });
  const rows = values.map((v) => {
    const num = Number(String(v.value).replace(/[<>≤≥,\s]/g, ""));
    const m = String(v.ref || "").match(/(-?\d+(?:\.\d+)?)\s*[-–]\s*(-?\d+(?:\.\d+)?)/);
    const lt = String(v.ref || "").match(/^\s*[<≤]\s*(-?\d+(?:\.\d+)?)/), gt = String(v.ref || "").match(/^\s*[>≥]\s*(-?\d+(?:\.\d+)?)/);
    return {
      patientId, documentId: docId, code: slug(v.name) || "test", name: v.name, category: CAT(v.name),
      value: isFinite(num) && /\d/.test(v.value) ? num : null, valueText: isFinite(num) && /\d/.test(v.value) ? null : v.value,
      unit: v.unit || null, refLow: m ? Number(m[1]) : gt ? Number(gt[1]) : null, refHigh: m ? Number(m[2]) : lt ? Number(lt[1]) : null, refText: v.ref || null,
      status: "final", collectedAt: date || new Date(), source: provider || "Uploaded report", panel: title,
    };
  });
  if (rows.length) await prisma.labResult.createMany({ data: rows });
  return rows.length;
}

export const docDTO = (d: { id: string; title: string; kind: string; provider: string | null; docDate: Date | null; source: string; mime: string; fileName: string; size: number; pages: number; extracted: string; summary: string | null; status: string; createdAt: Date }) => {
  let ex: DocReading = { values: [], keyPoints: [] };
  try { ex = { ...ex, ...JSON.parse(d.extracted || "{}") }; } catch {}
  return { id: d.id, title: d.title, kind: d.kind, provider: d.provider, date: d.docDate ? d.docDate.toISOString().slice(0, 10) : null, source: d.source, mime: d.mime, fileName: d.fileName, size: d.size, pages: d.pages, values: ex.values || [], keyPoints: ex.keyPoints || [], aiFailed: !!ex.aiFailed, summary: d.summary, status: d.status, addedAt: d.createdAt.toISOString() };
};
export const DOC_SELECT = { id: true, title: true, kind: true, provider: true, docDate: true, source: true, mime: true, fileName: true, size: true, pages: true, extracted: true, summary: true, status: true, createdAt: true } as const;
