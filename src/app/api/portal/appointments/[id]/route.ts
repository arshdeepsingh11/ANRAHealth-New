// POST /api/portal/appointments/:id
//   { action: "prep", shareTrends, shareResults, shareSymptoms } — save visit preparation
//     (also attaches the patient's open visit questions to this appointment)
//   { action: "reschedule" } — request a reschedule (clinic follows up)
import { prisma } from "@backend/db";
import { getAppointments } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatientMutation, readJson, HttpError } from "@backend/apiHelpers";

export const POST = (req: Request, ctx: { params: Promise<{ id: string }> }) => withPatientMutation(async ({ patient, ip }) => {
  const { id } = await ctx.params;
  const appt = await prisma.appointment.findFirst({ where: { id, patientId: patient.id }, select: { id: true, startsAt: true, status: true } });
  if (!appt) throw new HttpError(404, "Appointment not found.");
  const b = await readJson(req);
  if (b.action === "prep") {
    await prisma.$transaction([
      prisma.appointment.update({ where: { id }, data: { prepShareTrends: b.shareTrends === true, prepShareResults: b.shareResults === true, prepShareSymptoms: b.shareSymptoms === true, prepSavedAt: new Date() } }),
      prisma.visitQuestion.updateMany({ where: { patientId: patient.id, appointmentId: null }, data: { appointmentId: id } }),
    ]);
  } else if (b.action === "reschedule") {
    if (appt.status !== "scheduled") throw new HttpError(400, "This appointment can't be rescheduled.");
    await prisma.appointment.update({ where: { id }, data: { rescheduleRequestedAt: new Date() } });
  } else throw new HttpError(400, "Unknown action.");
  audit(patient.id, "patient", "update", `appointment:${id}:${b.action}`, ip);
  return getAppointments(patient);
});
