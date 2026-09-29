// GET /api/portal/results — laboratory results (latest per test + history)
import { getResults } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "results", ip);
  return getResults(patient);
});
