// POST /api/portal/devices/pair { provider } → a one-time QR code (15 min)
// the patient scans with their iPhone to set up Apple Health sync.
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { prisma } from "@backend/db";
import { sha256 } from "@backend/patientAuth";
import { audit } from "@backend/audit";
import { publicBase } from "@backend/publicBase";
import { DEVICE_CATALOG } from "@/lib/portal/devices";
import { withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

const TTL_MIN = 15;

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const provider = str((await readJson(req)).provider, 20);
  const dev = DEVICE_CATALOG.find((d) => d.id === provider);
  if (!dev || dev.mode !== "shortcut") throw new HttpError(400, "QR pairing is for iPhone and Apple Watch.");
  const code = randomBytes(18).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MIN * 60_000);
  await prisma.devicePairing.deleteMany({ where: { OR: [{ patientId: patient.id }, { expiresAt: { lt: new Date(Date.now() - 86_400_000) } }] } });
  await prisma.devicePairing.create({ data: { codeHash: sha256(code), patientId: patient.id, provider, expiresAt } });
  const { base, local } = publicBase(req);
  const url = `${base}/connect/${code}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#14181B", light: "#FFFFFF" } });
  audit(patient.id, "patient", "create", `device-pair:${provider}`, ip);
  return { url, qrSvg, expiresAt: expiresAt.toISOString(), local };
});
