// GET    /api/portal/heart — home blood pressure + heart signals
// POST   /api/portal/heart — { sys, dia, pulse?, takenAt?, note? } add a home reading
// DELETE /api/portal/heart?id= — remove a reading you entered
import { prisma } from "@backend/db";
import { getHeart } from "@backend/universe";
import { storeBp, validBp, refreshBpDays, evaluateRewards } from "@backend/health";
import { audit } from "@backend/audit";
import { withPatient, withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "heart", ip);
  return getHeart(patient);
});

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const err = validBp(b);
  if (err) throw new HttpError(400, err);
  let takenAt = b.takenAt ? new Date(String(b.takenAt)) : new Date();
  if (isNaN(takenAt.getTime()) || takenAt.getTime() > Date.now() + 5 * 60000) throw new HttpError(400, "Please check the date and time.");
  if (Date.now() - takenAt.getTime() > 365 * 86400000) throw new HttpError(400, "Readings older than a year can't be added here.");
  takenAt = new Date(Math.floor(takenAt.getTime() / 1000) * 1000);
  await storeBp(patient, "manual", [{ sys: Number(b.sys), dia: Number(b.dia), pulse: b.pulse == null || b.pulse === "" ? null : Number(b.pulse), takenAt, note: str(b.note, 140) || null }]);
  await evaluateRewards(patient).catch(() => 0);
  audit(patient.id, "patient", "create", "bp-reading", ip);
  return getHeart(patient);
});

export const DELETE = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const id = (new URL(req.url).searchParams.get("id") || "").slice(0, 40);
  const r = await prisma.bpReading.findFirst({ where: { id, patientId: patient.id }, select: { id: true, day: true, source: true } });
  if (!r) throw new HttpError(404, "Reading not found.");
  if (r.source !== "manual" && r.source !== "import") throw new HttpError(400, "Readings from a connected device are removed in the device's own app.");
  await prisma.bpReading.delete({ where: { id: r.id } });
  await refreshBpDays(patient.id, r.source, [r.day]);
  audit(patient.id, "patient", "delete", "bp-reading", ip);
  return getHeart(patient);
});
