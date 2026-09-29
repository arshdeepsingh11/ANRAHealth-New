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
  | { t: "conversation"; type: string; id: string };

// Back target for detail screens (the section tabs cover everything else).
export const PARENT: Partial<Record<Screen, Screen>> = { result: "results", trend: "trends", privacy: "profile", settings: "profile" };
export const LABELS: Record<Screen, string> = { today: "Today", trends: "Trends", results: "Results", protocol: "Protocol", more: "More", history: "History", devices: "Devices", appointments: "Appointments", referrals: "Referrals", profile: "Profile", privacy: "Privacy", settings: "Notifications", result: "Result", trend: "Trend" };

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
