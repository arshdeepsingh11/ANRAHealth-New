// Display formatting for the admin console. The clinic is in Calgary, so
// every staff-facing time is shown in Mountain Time.

const TZ = "America/Edmonton";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (d: Date) => dayKeyFmt.format(d);
const clean = (s: string) => s.replace(/ | /g, " ");

export const fmtTime = (d: Date) => clean(d.toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }));
const monDay = (d: Date) => clean(d.toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric" }));
const year = (d: Date) => Number(d.toLocaleDateString("en-US", { timeZone: TZ, year: "numeric" }));

/** "Sep 29, 2026" */
export const fmtDate = (d: Date) => clean(d.toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" }));
/** "Mar 2025" */
export const fmtMonthYear = (d: Date) => clean(d.toLocaleDateString("en-US", { timeZone: TZ, month: "short", year: "numeric" }));
/** "Sep 29, 2026 · 10:44 a.m." */
export const fmtFull = (d: Date) => `${fmtDate(d)} · ${fmtTime(d)}`;

function dayDiff(d: Date, now = new Date()) {
  const a = new Date(dayKey(d) + "T00:00:00Z").getTime(), b = new Date(dayKey(now) + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

/** "Today, 8:14 a.m." · "Yesterday" · "Sep 27" · "Feb 26, 2025" (withTime adds the time to older dates) */
export function fmtShort(d: Date | null | undefined, withTime = false): string {
  if (!d) return "—";
  const diff = dayDiff(d), now = new Date();
  if (diff === 0) return `Today, ${fmtTime(d)}`;
  if (diff === 1) return withTime ? `Yesterday, ${fmtTime(d)}` : "Yesterday";
  const base = year(d) === year(now) ? monDay(d) : fmtDate(d);
  return withTime ? `${base}, ${fmtTime(d)}` : base;
}

/** Date part only for two-part displays: "Today" · "Yesterday" · "Sep 25" · "Feb 27, 2025" */
export function fmtDay(d: Date): string {
  const diff = dayDiff(d);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return year(d) === year(new Date()) ? monDay(d) : fmtDate(d);
}

/** "4 min ago" · "1 hr ago" · "Yesterday" · "3 days ago" · "2 weeks ago" · "Never" */
export function fmtAgo(d: Date | null | undefined): string {
  if (!d) return "Never";
  const m = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24 && dayDiff(d) === 0) return `${h} hr ago`;
  const days = dayDiff(d);
  if (days <= 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const w = Math.round(days / 7);
  if (days < 30) return w === 1 ? "1 week ago" : `${w} weeks ago`;
  return fmtShort(d);
}

export const minsAgo = (d: Date | null | undefined) => (d ? Math.max(0, Math.round((Date.now() - d.getTime()) / 60000)) : 1e9);

export function initials(first: string, last: string) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase() || "?";
}

export function ageFrom(dob: Date | null): number | null {
  if (!dob) return null;
  const n = new Date();
  let a = n.getUTCFullYear() - dob.getUTCFullYear();
  if (n.getUTCMonth() < dob.getUTCMonth() || (n.getUTCMonth() === dob.getUTCMonth() && n.getUTCDate() < dob.getUTCDate())) a--;
  return a;
}

/** "142.59.xx.18" — enough for staff to recognise a network, not a full address. */
export function maskIp(ip: string | null | undefined): string {
  if (!ip || ip === "unknown") return "—";
  const v4 = ip.match(/^(\d+)\.(\d+)\.\d+\.(\d+)$/);
  if (v4) return `${v4[1]}.${v4[2]}.xx.${v4[3]}`;
  const parts = ip.split(":").filter(Boolean);
  return parts.length > 2 ? `${parts.slice(0, 2).join(":")}:…` : ip;
}

/** "iPhone" + "Safari 19" from a user-agent string. */
export function parseUA(ua: string | null | undefined): { device: string; os: string; browser: string } {
  const s = ua || "";
  const device = /iPad/.test(s) ? "iPad" : /iPhone/.test(s) ? "iPhone" : /Android/.test(s) ? (/Mobile/.test(s) ? "Android phone" : "Android tablet") : /Macintosh|Mac OS X/.test(s) ? "Mac" : /Windows/.test(s) ? "Windows PC" : /Linux/.test(s) ? "Linux PC" : "Unknown device";
  const os = /iPad|iPhone/.test(s) ? "iOS" : /Android/.test(s) ? "Android" : /Mac OS X|Macintosh/.test(s) ? "macOS" : /Windows/.test(s) ? "Windows" : /Linux/.test(s) ? "Linux" : "Unknown";
  const m = s.match(/Edg\/(\d+)/) ? ["Edge", s.match(/Edg\/(\d+)/)![1]] : s.match(/Firefox\/(\d+)/) ? ["Firefox", s.match(/Firefox\/(\d+)/)![1]] : s.match(/Chrome\/(\d+)/) && !/Chromium/.test(s) ? ["Chrome", s.match(/Chrome\/(\d+)/)![1]] : s.match(/Version\/(\d+).*Safari/) ? ["Safari", s.match(/Version\/(\d+)/)![1]] : null;
  return { device, os, browser: m ? `${m[0]} ${m[1]}` : "Browser" };
}

export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-CA");
export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Short display code from a database id: "R-3F9K2A" */
export const shortCode = (prefix: string, id: string) => `${prefix}-${id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`;

/** Test / demo records are created with ids that start with "test_". */
export const isTestId = (id: string | null | undefined) => !!id && id.startsWith("test_");
