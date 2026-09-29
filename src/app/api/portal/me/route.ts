// GET   /api/portal/me — profile (name, age, goals, care team…)
// PATCH /api/portal/me — update name, phone, date of birth, timezone
import { prisma } from "@backend/db";
import { getProfile } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient, withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "profile", ip);
  return getProfile(patient.id);
});

export const PATCH = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const data: Record<string, unknown> = {};
  if ("firstName" in b) { const v = str(b.firstName, 60); if (!v) throw new HttpError(400, "First name can't be empty."); data.firstName = v; }
  if ("lastName" in b) { const v = str(b.lastName, 60); if (!v) throw new HttpError(400, "Last name can't be empty."); data.lastName = v; }
  if ("phone" in b) { const v = str(b.phone, 30); if (v && !/^[+()\d\s.-]{7,30}$/.test(v)) throw new HttpError(400, "Please check the phone number."); data.phone = v || null; }
  if ("dateOfBirth" in b) {
    if (!b.dateOfBirth) data.dateOfBirth = null;
    else { const d = new Date(String(b.dateOfBirth) + "T00:00:00Z"); if (isNaN(d.getTime()) || d > new Date() || d.getUTCFullYear() < 1900) throw new HttpError(400, "Please check your date of birth."); data.dateOfBirth = d; }
  }
  if ("timezone" in b) { const tz = str(b.timezone, 60); if (!Intl.supportedValuesOf?.("timeZone").includes(tz)) throw new HttpError(400, "Unknown timezone."); data.timezone = tz; }
  if (!Object.keys(data).length) throw new HttpError(400, "Nothing to update.");
  await prisma.patient.update({ where: { id: patient.id }, data });
  audit(patient.id, "patient", "update", "profile", ip);
  return getProfile(patient.id);
});
