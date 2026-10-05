// GET /api/portal/food/{id}/photo
import { prisma } from "@backend/db";
import { getCurrentPatient } from "@backend/patientAuth";

export async function GET(_r: Request, { params }: { params: Promise<{ id: string }> }) {
  const patient = await getCurrentPatient();
  if (!patient) return new Response(null, { status: 401 });
  const l = await prisma.foodLog.findFirst({ where: { id: (await params).id.slice(0, 40), patientId: patient.id }, select: { photo: true, photoMime: true } });
  if (!l?.photo || !l.photoMime) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(l.photo), { headers: { "Content-Type": l.photoMime, "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" } });
}
