// DELETE /api/portal/wearable-data — delete all imported wearable readings
// (Privacy & Data → "Disconnecting services"). Clinic-entered values stay.
import { prisma } from "@backend/db";
import { audit } from "@backend/audit";
import { withPatientMutation } from "@backend/apiHelpers";

export const DELETE = () => withPatientMutation(async ({ patient, ip }) => {
  const { count } = await prisma.healthReading.deleteMany({ where: { patientId: patient.id, source: { notIn: ["clinic"] } } });
  audit(patient.id, "patient", "delete", `wearable-data:${count}`, ip);
  return { deleted: count };
});
