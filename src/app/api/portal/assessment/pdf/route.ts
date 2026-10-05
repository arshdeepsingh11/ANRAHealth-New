// POST /api/portal/assessment/pdf — { days, sections[], docIds[], observations[], questions[] }
// Returns the Doctor Assessment PDF (summary + chosen original reports).
import { getAssessment } from "@backend/space";
import { buildAssessmentPdf } from "@backend/assessmentPdf";
import { rateLimit } from "@backend/rateLimit";
import { audit } from "@backend/audit";
import { withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

export const maxDuration = 60;
const DAYS = [30, 90, 180, 365, 3650];

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  if (!rateLimit(`assesspdf:${patient.id}`, 10, 10 * 60_000)) throw new HttpError(429, "Please wait a few minutes before creating another PDF.");
  const b = await readJson(req, 64_000);
  const days = DAYS.includes(Number(b.days)) ? Number(b.days) : 90;
  const arr = (v: unknown, n: number, len: number) => (Array.isArray(v) ? v.slice(0, n).map((s) => str(s, len)).filter(Boolean) : []);
  const a = await getAssessment(patient, days);
  const bytes = await buildAssessmentPdf(patient.id, a, { sections: arr(b.sections, 20, 20), docIds: arr(b.docIds, 20, 40), observations: arr(b.observations, 8, 300), questions: arr(b.questions, 12, 300) });
  audit(patient.id, "patient", "create", `assessment-pdf:${days}`, ip);
  const name = `Doctor-Assessment-${patient.firstName}-${new Date().toISOString().slice(0, 10)}.pdf`.replace(/[^\w.-]/g, "");
  return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store" } });
});
