// POST /api/wearables/ingest — wearable data in (Apple Watch via iOS Shortcuts
// today; the same endpoint serves a native companion app later).
//
// Auth: "Authorization: Bearer anra_dev_…" — the per-device token issued in
// My Health Space → Devices → Apple Watch. Only its SHA-256 is stored.
// Body: see backend/wearables.ts (structured or flat Shortcuts object).
// Only metrics the patient allows for that device are stored; the rest are
// reported back as rejected. Re-sending the same day overwrites (idempotent).
import { NextResponse } from "next/server";
import { prisma } from "@backend/db";
import { sha256, clientMeta } from "@backend/patientAuth";
import { rateLimit } from "@backend/rateLimit";
import { audit } from "@backend/audit";
import { parseIngest } from "@backend/wearables";
import { allowedMetrics } from "@/lib/portal/devices";
import { readJson, toResponse, HttpError } from "@backend/apiHelpers";
import type { ProviderId } from "@/lib/portal/types";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token.startsWith("anra_dev_") || token.length > 80) throw new HttpError(401, "Missing or invalid device token.");
    const { ip } = await clientMeta();
    if (!rateLimit(`ingest:${sha256(token).slice(0, 16)}`, 60, 60_000)) throw new HttpError(429, "Too many requests.");

    const conn = await prisma.deviceConnection.findUnique({
      where: { tokenHash: sha256(token) },
      select: { id: true, provider: true, status: true, dataTypes: true, patient: { select: { id: true, timezone: true, settings: { select: { shareWearables: true } } } } },
    });
    if (!conn || conn.status === "disconnected") throw new HttpError(401, "Missing or invalid device token.");
    if (conn.patient.settings && !conn.patient.settings.shareWearables) throw new HttpError(403, "Wearable sharing is turned off in Privacy & Data.");

    const body = await readJson(req, 2_000_000);
    const { readings, rejected } = parseIngest(body, conn.patient.timezone);
    const allowed = allowedMetrics(conn.provider as ProviderId, JSON.parse(conn.dataTypes || "[]"));
    const accepted = readings.filter((r) => allowed.has(r.metric));
    readings.filter((r) => !allowed.has(r.metric)).forEach((r) => rejected.push({ field: r.metric, reason: "not shared for this device (Devices → Manage)" }));

    const patientId = conn.patient.id, source = conn.provider;
    for (let i = 0; i < accepted.length; i += 200) {
      await prisma.$transaction(accepted.slice(i, i + 200).map((r) => prisma.healthReading.upsert({
        where: { patientId_metric_day_source: { patientId, metric: r.metric, day: r.day, source } },
        create: { patientId, metric: r.metric, day: r.day, source, value: r.value, valueText: r.valueText, recordedAt: r.recordedAt },
        update: { value: r.value, valueText: r.valueText, recordedAt: r.recordedAt },
      })));
    }
    const now = new Date();
    await prisma.deviceConnection.update({ where: { id: conn.id }, data: { status: "connected", lastSyncAt: now, ...(conn.status === "pending" ? { connectedAt: now } : {}) } });
    audit(patientId, "device", "create", `readings:${source}:${accepted.length}`, ip);
    return NextResponse.json({ ok: true, stored: accepted.length, rejected }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return toResponse(e);
  }
}
