// GET /api/portal/trends — up to 2 years of daily series for every chart metric
import { getTrends } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "trends", ip);
  return getTrends(patient);
});
