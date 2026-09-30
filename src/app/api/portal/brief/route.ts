// GET /api/portal/brief — NEYU Today: location-aware daily brief.
import { getBrief } from "@backend/brief";
import { syncAll } from "@backend/oauth";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  // Pull OAuth sources that haven't synced for 6 h (works without a scheduler).
  await syncAll(6, patient.id).catch(() => {});
  audit(patient.id, "patient", "read", "brief", ip);
  return getBrief(patient);
});
