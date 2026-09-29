// GET   /api/portal/settings — data-sharing consents + notification preferences
// PATCH /api/portal/settings — { key: boolean } for any of the fields below
import { prisma } from "@backend/db";
import { getSettings } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient, withPatientMutation, readJson, HttpError } from "@backend/apiHelpers";

const KEYS = ["shareWearables", "shareLabs", "shareRecords", "albaAccess", "notifDaily", "notifWorth", "notifProtocol", "notifAppt"] as const;

export const GET = () => withPatient(async ({ patient }) => getSettings(patient.id));

export const PATCH = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const data: Record<string, boolean> = {};
  KEYS.forEach((k) => { if (typeof b[k] === "boolean") data[k] = b[k]; });
  if (!Object.keys(data).length) throw new HttpError(400, "Nothing to update.");
  await prisma.patientSettings.upsert({ where: { patientId: patient.id }, create: { patientId: patient.id, ...data }, update: data });
  audit(patient.id, "patient", "update", `settings:${Object.keys(data).join(",")}`, ip);
  return getSettings(patient.id);
});
