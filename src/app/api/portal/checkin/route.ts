// GET  /api/portal/checkin — is a weekly check-in due? (+ last one)
// POST /api/portal/checkin — { feeling 1-5, energy?, sleep?, stress?, activity?, pain?, note? } or { skip: true }
import { prisma } from "@backend/db";
import { withPatient, withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";
import { award } from "@backend/health";
import { dayKey, addDays } from "@/lib/portal/metrics";

const scale = (v: unknown) => { const n = Math.round(Number(v)); return n >= 1 && n <= 5 ? n : null; };

export const GET = () => withPatient(async ({ patient }) => {
  const today = dayKey(new Date(), patient.timezone);
  const [last, skipped] = await Promise.all([
    prisma.healthCheckIn.findFirst({ where: { patientId: patient.id }, orderBy: { day: "desc" }, select: { day: true, feeling: true } }),
    prisma.generatedNote.findFirst({ where: { patientId: patient.id, kind: "checkin-skip", period: { gt: addDays(today, -7) } } }),
  ]);
  return { due: !skipped && (!last || last.day <= addDays(today, -6)), last };
});

export const POST = (req: Request) => withPatientMutation(async ({ patient }) => {
  const b = await readJson(req);
  const today = dayKey(new Date(), patient.timezone);
  if (b.skip === true) { await prisma.generatedNote.upsert({ where: { patientId_kind_period: { patientId: patient.id, kind: "checkin-skip", period: today } }, create: { patientId: patient.id, kind: "checkin-skip", period: today, body: "{}" }, update: {} }); return { ok: true, skipped: true }; }
  const feeling = scale(b.feeling);
  if (!feeling) throw new HttpError(400, "Choose how you've been feeling.");
  await prisma.healthCheckIn.deleteMany({ where: { patientId: patient.id, day: today } });
  const row = await prisma.healthCheckIn.create({ data: { patientId: patient.id, day: today, feeling, energy: scale(b.energy), sleep: scale(b.sleep), stress: scale(b.stress), activity: scale(b.activity), pain: scale(b.pain), note: str(b.note, 300) || null } });
  await award(patient.id, "checkin", today).catch(() => 0);
  return { ok: true, id: row.id };
});
