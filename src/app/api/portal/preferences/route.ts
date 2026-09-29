// PATCH /api/portal/preferences — daily brief location + options
//   { city, province } | { lat, lon } (nearest city) | { clearLocation: true }
//   { briefEmail: boolean } | { leaderboardName: string }
import { prisma } from "@backend/db";
import { getSettings } from "@backend/patientData";
import { findPlace, nearestPlace } from "@/lib/portal/places";
import { audit } from "@backend/audit";
import { withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

export const PATCH = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const data: Record<string, unknown> = {};
  if (b.clearLocation === true) Object.assign(data, { city: null, province: null, lat: null, lon: null });
  else if (typeof b.lat === "number" && typeof b.lon === "number") {
    if (Math.abs(b.lat) > 90 || Math.abs(b.lon) > 180) throw new HttpError(400, "Invalid location.");
    const p = nearestPlace(b.lat, b.lon); // store the city, not the exact position
    Object.assign(data, { city: p.city, province: p.prov, lat: p.lat, lon: p.lon });
  } else if (typeof b.city === "string") {
    const p = findPlace(str(b.city, 60), str(b.province, 4) || null);
    if (!p) throw new HttpError(400, "Choose a city from the list.");
    Object.assign(data, { city: p.city, province: p.prov, lat: p.lat, lon: p.lon });
  }
  if (typeof b.briefEmail === "boolean") data.briefEmail = b.briefEmail;
  if (typeof b.leaderboardName === "string") data.leaderboardName = str(b.leaderboardName, 30) || null;
  if (!Object.keys(data).length) throw new HttpError(400, "Nothing to update.");
  await prisma.patientSettings.upsert({ where: { patientId: patient.id }, create: { patientId: patient.id, ...data }, update: data });
  audit(patient.id, "patient", "update", `preferences:${Object.keys(data).join(",")}`, ip);
  return getSettings(patient.id);
});
