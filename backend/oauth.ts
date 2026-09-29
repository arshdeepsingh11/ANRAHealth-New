// One-time connections (OAuth 2) for Withings, Oura and WHOOP, plus the
// daily pull. Tokens are encrypted at rest (AES-256-GCM, key from
// TOKEN_ENC_KEY). A maker is only offered when its client id + secret are
// set on the server:
//   WITHINGS_CLIENT_ID / WITHINGS_CLIENT_SECRET
//   OURA_CLIENT_ID     / OURA_CLIENT_SECRET
//   WHOOP_CLIENT_ID    / WHOOP_CLIENT_SECRET
// Redirect URI to register with each maker:
//   {PUBLIC_BASE_URL}/api/portal/oauth/{provider}/callback

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "@backend/db";
import { dayKey, addDays, type MetricKey } from "@/lib/portal/metrics";
import { allowedMetrics } from "@/lib/portal/devices";
import type { ProviderId } from "@/lib/portal/types";
import type { ParsedReading } from "@backend/wearables";
import { storeReadings, storeBp, type BpIn } from "@backend/health";

export type OAuthProvider = "withings" | "oura" | "whoop";
export const OAUTH_PROVIDERS: OAuthProvider[] = ["withings", "oura", "whoop"];
export const isOAuthProvider = (p: string): p is OAuthProvider => (OAUTH_PROVIDERS as string[]).includes(p);

// ── Encryption ──────────────────────────────────────────────────────────
function encKey(): Buffer | null {
  const k = process.env.TOKEN_ENC_KEY || process.env.ADMIN_SESSION_SECRET;
  return k ? createHash("sha256").update(k).digest() : null;
}
export function encrypt(text: string): string {
  const key = encKey();
  if (!key) throw new Error("TOKEN_ENC_KEY missing");
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", key, iv);
  const out = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), out.toString("base64url")].join(".");
}
export function decrypt(s: string): string {
  const key = encKey();
  if (!key) throw new Error("TOKEN_ENC_KEY missing");
  const [v, iv, tag, data] = s.split(".");
  if (v !== "v1") throw new Error("bad token format");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
}

// ── Provider config ─────────────────────────────────────────────────────
const env = (p: OAuthProvider, k: "CLIENT_ID" | "CLIENT_SECRET") => process.env[`${p.toUpperCase()}_${k}`] || "";
export const oauthConfigured = (p: string) => isOAuthProvider(p) && !!env(p, "CLIENT_ID") && !!env(p, "CLIENT_SECRET") && !!encKey();

export const baseUrl = (req?: Request) => (process.env.PUBLIC_BASE_URL || (req ? new URL(req.url).origin : "http://localhost:3000")).replace(/\/$/, "");
export const redirectUri = (p: OAuthProvider, req?: Request) => `${baseUrl(req)}/api/portal/oauth/${p}/callback`;

const CFG: Record<OAuthProvider, { auth: string; token: string; scope: string }> = {
  withings: { auth: "https://account.withings.com/oauth2_user/authorize2", token: "https://wbsapi.withings.net/v2/oauth2", scope: "user.metrics" },
  oura: { auth: "https://cloud.ouraring.com/oauth/authorize", token: "https://api.ouraring.com/oauth/token", scope: "daily heartrate personal session spo2 workout" },
  whoop: { auth: "https://api.prod.whoop.com/oauth/oauth2/auth", token: "https://api.prod.whoop.com/oauth/oauth2/token", scope: "offline read:recovery read:sleep read:cycles" },
};

export function authorizeUrl(p: OAuthProvider, state: string, req?: Request) {
  const q = new URLSearchParams({ response_type: "code", client_id: env(p, "CLIENT_ID"), redirect_uri: redirectUri(p, req), scope: p === "withings" ? CFG[p].scope : CFG[p].scope, state });
  return `${CFG[p].auth}?${q}`;
}

type Tokens = { access: string; refresh: string | null; expiresAt: Date; userId: string | null };
type Fetch = typeof fetch;

async function tokenRequest(p: OAuthProvider, params: Record<string, string>, f: Fetch = fetch): Promise<Tokens> {
  const body = new URLSearchParams({ ...params, client_id: env(p, "CLIENT_ID"), client_secret: env(p, "CLIENT_SECRET"), ...(p === "withings" ? { action: "requesttoken" } : {}) });
  const res = await f(CFG[p].token, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(20_000) });
  const j: any = await res.json().catch(() => ({}));
  const t = p === "withings" ? (j?.status === 0 ? j.body : null) : res.ok ? j : null;
  if (!t?.access_token) throw new Error(`${p} token error ${res.status}${j?.error ? " " + j.error : ""}`);
  return { access: t.access_token, refresh: t.refresh_token || null, expiresAt: new Date(Date.now() + (Number(t.expires_in) || 3600) * 1000), userId: t.userid != null ? String(t.userid) : t.user_id != null ? String(t.user_id) : null };
}

export const exchangeCode = (p: OAuthProvider, code: string, req?: Request, f?: Fetch) => tokenRequest(p, { grant_type: "authorization_code", code, redirect_uri: redirectUri(p, req) }, f);

export async function saveTokens(patientId: string, p: OAuthProvider, t: Tokens, dataTypes: string[]) {
  const data = { status: "connected", accessTokenEnc: encrypt(t.access), refreshTokenEnc: t.refresh ? encrypt(t.refresh) : null, tokenExpiresAt: t.expiresAt, externalUserId: t.userId, lastError: null, tokenHash: null, tokenHint: null };
  await prisma.deviceConnection.upsert({
    where: { patientId_provider: { patientId, provider: p } },
    create: { patientId, provider: p, dataTypes: JSON.stringify(dataTypes), connectedAt: new Date(), ...data },
    update: { connectedAt: new Date(), ...data },
  });
}

// ── Pull + parse ────────────────────────────────────────────────────────
const tzMinutes = (iso: string, tz: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(d).split(":").map(Number);
  return (h % 24) * 60 + m;
};
const R = (metric: MetricKey, day: string, value: number | null | undefined, at: Date, valueText: string | null = null): ParsedReading | null =>
  value == null || !isFinite(value) ? null : { metric, day, value: Math.round(value * 100) / 100, valueText, recordedAt: at };

export interface Pulled { readings: ParsedReading[]; bp: BpIn[] }

export function parseOura(j: { sleep?: any; activity?: any; spo2?: any }, tz: string): Pulled {
  const out: (ParsedReading | null)[] = [], now = new Date();
  const longest = new Map<string, any>();
  (j.sleep?.data || []).forEach((s: any) => { if (!s?.day || (s.type && s.type !== "long_sleep" && s.type !== "sleep")) return; const c = longest.get(s.day); if (!c || (s.total_sleep_duration || 0) > (c.total_sleep_duration || 0)) longest.set(s.day, s); });
  longest.forEach((s, day) => {
    const at = s.bedtime_end ? new Date(s.bedtime_end) : now;
    out.push(R("sleep", day, s.total_sleep_duration != null ? s.total_sleep_duration / 3600 : null, at), R("timeInBed", day, s.time_in_bed != null ? s.time_in_bed / 3600 : null, at),
      R("hrv", day, s.average_hrv, at), R("rhr", day, s.lowest_heart_rate, at), R("bedtime", day, s.bedtime_start ? tzMinutes(s.bedtime_start, tz) : null, at));
  });
  (j.activity?.data || []).forEach((a: any) => {
    if (!a?.day) return;
    out.push(R("steps", a.day, a.steps, now), R("active", a.day, a.high_activity_time != null ? ((a.high_activity_time || 0) + (a.medium_activity_time || 0)) / 60 : null, now), R("activeEnergy", a.day, a.active_calories, now));
  });
  (j.spo2?.data || []).forEach((x: any) => { if (x?.day) out.push(R("spo2", x.day, x.spo2_percentage?.average, now)); });
  return { readings: out.filter(Boolean) as ParsedReading[], bp: [] };
}

export function parseWhoop(j: { recovery?: any[]; sleep?: any[] }, tz: string): Pulled {
  const out: (ParsedReading | null)[] = [];
  (j.recovery || []).forEach((r: any) => {
    if (r?.score_state !== "SCORED" || !r.score) return;
    const at = new Date(r.updated_at || r.created_at), day = dayKey(at, tz);
    out.push(R("rhr", day, r.score.resting_heart_rate, at), R("hrv", day, r.score.hrv_rmssd_milli, at), R("spo2", day, r.score.spo2_percentage, at));
  });
  (j.sleep || []).forEach((s: any) => {
    if (s?.nap || s?.score_state !== "SCORED" || !s.score?.stage_summary || !s.end) return;
    const at = new Date(s.end), day = dayKey(at, tz), st = s.score.stage_summary;
    const inBed = st.total_in_bed_time_milli / 3.6e6, asleep = (st.total_in_bed_time_milli - (st.total_awake_time_milli || 0)) / 3.6e6;
    out.push(R("sleep", day, asleep, at), R("timeInBed", day, inBed, at), R("bedtime", day, s.start ? tzMinutes(s.start, tz) : null, at));
  });
  return { readings: out.filter(Boolean) as ParsedReading[], bp: [] };
}

export function parseWithings(j: any, tz: string): Pulled {
  const readings: ParsedReading[] = [], bp: BpIn[] = [];
  const weightByDay = new Map<string, { v: number; at: Date }>();
  (j?.body?.measuregrps || []).forEach((g: any) => {
    const at = new Date(Number(g.date) * 1000);
    if (isNaN(at.getTime())) return;
    const val = (t: number) => { const m = (g.measures || []).find((x: any) => x.type === t); return m ? m.value * Math.pow(10, m.unit) : null; };
    const sys = val(10), dia = val(9), pulse = val(11), w = val(1);
    if (sys && dia) bp.push({ sys: Math.round(sys), dia: Math.round(dia), pulse: pulse ? Math.round(pulse) : null, takenAt: at });
    if (w) { const day = dayKey(at, tz), c = weightByDay.get(day); if (!c || at > c.at) weightByDay.set(day, { v: w, at }); }
  });
  weightByDay.forEach((x, day) => readings.push({ metric: "weight", day, value: Math.round(x.v * 10) / 10, valueText: null, recordedAt: x.at }));
  return { readings, bp };
}

async function getJson(url: string, token: string, f: Fetch, init?: RequestInit) {
  const res = await f(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) }, signal: AbortSignal.timeout(20_000) });
  if (res.status === 401) throw Object.assign(new Error("unauthorized"), { status: 401 });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function pull(p: OAuthProvider, token: string, fromDay: string, toDay: string, tz: string, f: Fetch = fetch): Promise<Pulled> {
  if (p === "oura") {
    const q = `start_date=${fromDay}&end_date=${addDays(toDay, 1)}`, b = "https://api.ouraring.com/v2/usercollection";
    const [sleep, activity, spo2] = await Promise.all([getJson(`${b}/sleep?${q}`, token, f), getJson(`${b}/daily_activity?${q}`, token, f), getJson(`${b}/daily_spo2?${q}`, token, f).catch(() => ({ data: [] }))]);
    return parseOura({ sleep, activity, spo2 }, tz);
  }
  if (p === "whoop") {
    const q = `start=${fromDay}T00:00:00.000Z&end=${addDays(toDay, 1)}T00:00:00.000Z&limit=25`, b = "https://api.prod.whoop.com/developer/v2";
    const all = async (path: string) => { const rows: any[] = []; let next = ""; for (let i = 0; i < 6; i++) { const j = await getJson(`${b}${path}?${q}${next ? `&nextToken=${encodeURIComponent(next)}` : ""}`, token, f); rows.push(...(j.records || [])); if (!j.next_token) break; next = j.next_token; } return rows; };
    const [recovery, sleep] = await Promise.all([all("/recovery"), all("/activity/sleep")]);
    return parseWhoop({ recovery, sleep }, tz);
  }
  const start = Math.floor(new Date(fromDay + "T00:00:00Z").getTime() / 1000) - 86400, end = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({ action: "getmeas", meastypes: "1,9,10,11", category: "1", startdate: String(start), enddate: String(end) });
  const j = await getJson("https://wbsapi.withings.net/measure", token, f, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (j?.status !== 0) throw new Error(`Withings status ${j?.status}`);
  return parseWithings(j, tz);
}

/** Pull the last `days` for one OAuth connection and store it. */
export async function syncConnection(connId: string, days = 7, f: Fetch = fetch): Promise<{ stored: number }> {
  const c = await prisma.deviceConnection.findUnique({ where: { id: connId }, select: { id: true, provider: true, status: true, dataTypes: true, accessTokenEnc: true, refreshTokenEnc: true, tokenExpiresAt: true, patient: { select: { id: true, timezone: true, settings: { select: { shareWearables: true } } } } } });
  if (!c || c.status !== "connected" || !c.accessTokenEnc || !isOAuthProvider(c.provider)) return { stored: 0 };
  if (c.patient.settings && !c.patient.settings.shareWearables) return { stored: 0 };
  const p = c.provider as OAuthProvider, tz = c.patient.timezone;
  try {
    let token = decrypt(c.accessTokenEnc);
    if (c.tokenExpiresAt && c.tokenExpiresAt.getTime() < Date.now() + 120_000 && c.refreshTokenEnc) {
      const t = await tokenRequest(p, { grant_type: "refresh_token", refresh_token: decrypt(c.refreshTokenEnc) }, f);
      await prisma.deviceConnection.update({ where: { id: c.id }, data: { accessTokenEnc: encrypt(t.access), refreshTokenEnc: t.refresh ? encrypt(t.refresh) : c.refreshTokenEnc, tokenExpiresAt: t.expiresAt } });
      token = t.access;
    }
    const today = dayKey(new Date(), tz);
    const got = await pull(p, token, addDays(today, -days), today, tz, f);
    const allowed = allowedMetrics(p as ProviderId, JSON.parse(c.dataTypes || "[]"));
    const readings = got.readings.filter((r) => allowed.has(r.metric));
    let stored = await storeReadings(c.patient.id, p, readings);
    if (allowed.has("bp") && got.bp.length) stored += await storeBp(c.patient, p, got.bp);
    await prisma.deviceConnection.update({ where: { id: c.id }, data: { lastSyncAt: new Date(), lastError: null } });
    return { stored };
  } catch (e: any) {
    const msg = e?.status === 401 ? "Sign-in expired — reconnect to keep syncing." : "Couldn't reach " + p + " — we'll try again.";
    await prisma.deviceConnection.update({ where: { id: c.id }, data: { lastError: msg } });
    console.error(`Sync ${p} failed:`, e?.message);
    return { stored: 0 };
  }
}

/** Sync every OAuth connection not synced in the last `minHours`. */
export async function syncAll(minHours = 6, patientId?: string) {
  const cutoff = new Date(Date.now() - minHours * 3600_000);
  const conns = await prisma.deviceConnection.findMany({ where: { status: "connected", provider: { in: OAUTH_PROVIDERS }, accessTokenEnc: { not: null }, ...(patientId ? { patientId } : {}), OR: [{ lastSyncAt: null }, { lastSyncAt: { lt: cutoff } }] }, select: { id: true } });
  let stored = 0;
  for (const c of conns) stored += (await syncConnection(c.id)).stored;
  return { connections: conns.length, stored };
}
