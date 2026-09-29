// GET /api/portal/history — timeline of everything linked to the patient
import { getHistory } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "history", ip);
  return getHistory(patient.id);
});
