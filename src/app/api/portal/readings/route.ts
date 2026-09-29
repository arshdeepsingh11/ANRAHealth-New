// POST /api/portal/readings — { metric: weight|glucose|steps|sleep|rhr, value, date? }
// A reading entered by the patient (source "manual"). Blood pressure uses /api/portal/heart.
import { parseIngest } from "@backend/wearables";
import { storeReadings } from "@backend/health";
import { audit } from "@backend/audit";
import { withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

const ALLOWED = ["weight", "glucose", "steps", "sleep", "rhr"];

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const metric = str(b.metric, 20);
  if (!ALLOWED.includes(metric)) throw new HttpError(400, "This reading can't be entered here.");
  const unit = str(b.unit, 10);
  const n = Number(b.value);
  if (!isFinite(n) || n <= 0) throw new HttpError(400, "Please enter a number.");
  const value = unit === "mg" ? `${n} mg/dL` : unit === "lb" ? `${n} lb` : n;
  const { readings: fixed, rejected } = parseIngest({ readings: [{ metric, value, date: b.date }] }, patient.timezone);
  if (!fixed.length) throw new HttpError(400, rejected[0]?.reason ? `Please check the value (${rejected[0].reason}).` : "Please check the value.");
  await storeReadings(patient.id, "manual", fixed);
  audit(patient.id, "patient", "create", `reading:${metric}`, ip);
  return { ok: true, stored: fixed.length };
});
