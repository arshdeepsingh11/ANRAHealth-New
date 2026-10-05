"use client";

import { createContext, useContext } from "react";
import type { ProfileDTO, SettingsDTO } from "@/lib/portal/types";
import type { Route, Screen } from "@/lib/portal/route";

export type { Route, Screen };
export type Sheet =
  | { t: "alba"; ask?: string }
  | { t: "protocol"; id: string }
  | { t: "prepare" }
  | { t: "manage"; id: string; token?: string }
  | { t: "conversation"; type: string; id: string }
  | { t: "connect"; id: string }
  | { t: "import" }
  | { t: "reading" }
  | { t: "bp" }
  | { t: "location" }
  | { t: "share" }
  | { t: "invite" }
  | { t: "challenge"; mode: "create" | "join" };

// Back target for detail screens (the section tabs cover everything else).
export const PARENT: Partial<Record<Screen, Screen>> = { result: "results", trend: "trends", careview: "family", story: "today", doc: "records", add: "records" };

// Primary tabs, and the sub-sections that live inside each (shown as a pill row).
export const TABS: { s: Screen; label: string; icon: string }[] = [
  { s: "today", label: "Today", icon: "sun" }, { s: "myhealth", label: "My Health", icon: "heartPulse" }, { s: "records", label: "Records", icon: "folder" },
  { s: "food", label: "Food", icon: "apple" }, { s: "plan", label: "Plan", icon: "target" }, { s: "assessment", label: "Doctor Report", icon: "doc" },
  { s: "appointments", label: "Appointments", icon: "calendar" }, { s: "family", label: "Family", icon: "users" }, { s: "devices", label: "Devices", icon: "watch" },
];
export const GROUPS: { tab: Screen; items: { s: Screen; label: string }[] }[] = [
  { tab: "myhealth", items: [{ s: "myhealth", label: "Overview" }, { s: "heart", label: "Heart" }, { s: "lifestyle", label: "Lifestyle" }, { s: "trends", label: "Trends" }, { s: "baseline", label: "Health profile" }] },
  { tab: "records", items: [{ s: "records", label: "Reports" }, { s: "results", label: "Lab results" }, { s: "history", label: "Timeline" }] },
  { tab: "plan", items: [{ s: "plan", label: "AI plan" }, { s: "protocol", label: "Care protocol" }, { s: "rewards", label: "Goals & rewards" }] },
  { tab: "appointments", items: [{ s: "appointments", label: "Appointments" }, { s: "referrals", label: "Referrals" }] },
  { tab: "profile", items: [{ s: "profile", label: "Account" }, { s: "privacy", label: "Privacy & data" }, { s: "settings", label: "Notifications" }] },
];
/** Which primary tab a screen belongs to (detail screens included). */
export const tabOf = (s: Screen): Screen => {
  const g = GROUPS.find((x) => x.items.some((i) => i.s === s));
  if (g) return g.tab;
  return ({ result: "records", trend: "myhealth", doc: "records", add: "records", careview: "family", story: "today", more: "profile" } as Partial<Record<Screen, Screen>>)[s] || s;
};
export const LABELS: Record<Screen, string> = { today: "Today", trends: "Trends", results: "Results", protocol: "Protocol", more: "More", history: "History", devices: "Devices", appointments: "Appointments", referrals: "Referrals", profile: "Profile", privacy: "Privacy", settings: "Notifications", result: "Result", trend: "Trend",
  heart: "Heart", lifestyle: "Lifestyle", family: "Family & sharing", careview: "Care view", rewards: "Rewards", story: "Monthly story", baseline: "Health profile",
  myhealth: "My Health", records: "Records", doc: "Report", add: "Add to Health Space", food: "Food", plan: "Plan", assessment: "Doctor Report" };

export interface PortalCtx {
  route: Route;
  go: (s: Screen, p?: Omit<Route, "s">) => void;
  tab: (s: Screen) => void;
  back: () => void;
  toast: (msg: string) => void;
  sheet: Sheet | null;
  openSheet: (s: Sheet | null) => void;
  profile: ProfileDTO;
  setProfile: (p: ProfileDTO) => void;
  settings: SettingsDTO;
  setSettings: (s: SettingsDTO) => void;
  tz: string;
  initials: string;
  addQuestion: (text: string) => Promise<void>;
}

export const Ctx = createContext<PortalCtx | null>(null);
export const usePortal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal outside PortalApp");
  return c;
};
