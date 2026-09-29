// GET /api/portal/appointments — upcoming/past visits, visit questions, prep sources
import { getAppointments } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "appointments", ip);
  return getAppointments(patient);
});
