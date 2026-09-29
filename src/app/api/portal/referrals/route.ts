// GET /api/portal/referrals — referral status timelines
import { getReferrals } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "referrals", ip);
  return getReferrals(patient);
});
