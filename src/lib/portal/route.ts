// My Health Space screen routing, shared by the server page (initial screen
// from ?s=…) and the client shell. Not a client module on purpose.

import { isMetricKey, type MetricKey } from "./metrics";

export type Screen = "today" | "trends" | "trend" | "results" | "result" | "protocol" | "devices" | "history" | "appointments" | "referrals" | "more" | "profile" | "privacy" | "settings"
  | "heart" | "lifestyle" | "family" | "careview" | "rewards" | "story" | "baseline"
  | "myhealth" | "records" | "doc" | "add" | "food" | "plan" | "assessment";
export type Route = { s: Screen; k?: MetricKey; id?: string };

export const SCREENS: Screen[] = ["today", "trends", "trend", "results", "result", "protocol", "devices", "history", "appointments", "referrals", "more", "profile", "privacy", "settings", "heart", "lifestyle", "family", "careview", "rewards", "story", "baseline", "myhealth", "records", "doc", "add", "food", "plan", "assessment"];

export function parseRoute(sp: Record<string, string | string[] | undefined>): Route {
  const s = typeof sp.s === "string" && (SCREENS as string[]).includes(sp.s) ? (sp.s as Screen) : "today";
  const k = typeof sp.k === "string" && isMetricKey(sp.k) ? sp.k : undefined;
  const id = typeof sp.id === "string" ? sp.id.slice(0, 40) : undefined;
  if (s === "trend" && !k) return { s: "trends" };
  if (s === "result" && !id) return { s: "results" };
  if (s === "careview" && !id) return { s: "family" };
  if (s === "doc" && !id) return { s: "records" };
  return { s, k, id };
}

export function routeUrl(r: Route): string {
  const q = new URLSearchParams();
  if (r.s !== "today") q.set("s", r.s);
  if (r.k) q.set("k", r.k);
  if (r.id) q.set("id", r.id);
  const s = q.toString();
  return "/my-health" + (s ? "?" + s : "");
}
