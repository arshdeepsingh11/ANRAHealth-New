// GET   /api/portal/health-profile — answers, auto-filled values, completion
// PATCH /api/portal/health-profile — { values: { fieldKey: value | null } }
import { prisma } from "@backend/db";
import { getHealthProfile } from "@backend/healthProfile";
import { ALL_FIELDS, cleanValue, type ProfileData } from "@/lib/portal/profileSchema";
import { parseJSON } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient, withPatientMutation, readJson, HttpError } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "health-profile", ip);
  return getHealthProfile(patient);
});

export const PATCH = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req, 32_000);
  const values = b?.values;
  if (!values || typeof values !== "object") throw new HttpError(400, "Nothing to save.");
  const row = await prisma.healthProfile.findUnique({ where: { patientId: patient.id } });
  const data = parseJSON<ProfileData>(row?.data, {});
  const changed: string[] = [];
  const before = { ...data };
  const show = (v: unknown): string | null => (v == null ? null : (Array.isArray(v) ? v.join("; ") : String(v)).slice(0, 300));
  for (const [k, v] of Object.entries(values)) {
    const f = ALL_FIELDS.find((x) => x.key === k);
    if (!f) continue;
    const c = cleanValue(f, v);
    if (c && typeof c === "object" && !Array.isArray(c)) throw new HttpError(400, c.error);
    if (c === null) delete data[k]; else data[k] = c as string | number | string[];
    changed.push(k);
  }
  if (!changed.length) throw new HttpError(400, "Nothing to save.");
  const json = JSON.stringify(data);
  // Keep a dated history of what changed (doctor summary: "recent profile changes").
  const log = changed.map((k) => ({ k, o: show(before[k]), n: show(data[k]) })).filter((x) => x.o !== x.n)
    .map((x) => ({ patientId: patient.id, field: x.k, label: ALL_FIELDS.find((f) => f.key === x.k)?.label || x.k, oldValue: x.o, newValue: x.n }));
  if (log.length) await prisma.profileChange.createMany({ data: log }).catch(() => {});
  await prisma.healthProfile.upsert({ where: { patientId: patient.id }, create: { patientId: patient.id, data: json }, update: { data: json } });
  audit(patient.id, "patient", "update", `health-profile:${changed.join(",")}`.slice(0, 190), ip);
  return getHealthProfile(patient, false);
});
