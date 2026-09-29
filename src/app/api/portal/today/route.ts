// GET /api/portal/today — Today screen model (refresh button)
import { getToday } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "today", ip);
  return getToday(patient);
});
