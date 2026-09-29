// Data shapes exchanged between the My Health Space API and the UI.
// Dates travel as ISO strings; days as YYYY-MM-DD (patient timezone).

import type { MetricKey } from "./metrics";

export type ProviderId = "apple" | "oura" | "whoop" | "garmin" | "gfit";

export interface ProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null; // YYYY-MM-DD
  age: number | null;
  memberSince: string; // "March 2025"
  timezone: string;
  photoUrl: string | null;
  goals: string[];
  careTeam: { id: string; init: string; name: string; role: string }[];
  connectedDevices: number;
}

export interface SignalDTO { k: MetricKey; label: string; value: string; unit: string; note: string }
export interface InsightDTO { tone: "lavender" | "peach"; eyebrow: string; text: string; detail?: string; source?: string; metric: MetricKey; stats?: { label: string; value: string }[]; cta: string }
export interface DayItemDTO { time: string; title: string; value: string; done: boolean }

export interface TodayDTO {
  dateLabel: string;
  greeting: string;
  hasWearable: boolean;
  syncLabel: string | null; // "Updated 2 min ago"
  picture: { status: "Steady" | "Worth watching" | "Recovering"; headline: string; text: string } | null;
  signals: SignalDTO[];
  insights: InsightDTO[];
  nextStep: { kind: "appointment"; text: string; appointmentId: string } | { kind: "assessment"; text: string } | null;
  dayItems: DayItemDTO[];
  areas: { label: string; on: boolean }[];
  sources: { label: string; icon: string }[];
}

export type Series = [string, number][]; // [day, value]

export interface TrendsDTO {
  today: string;
  series: Partial<Record<MetricKey, Series>>;
  sources: Partial<Record<MetricKey, string>>; // latest source label
  rows: Record<"heart" | "recovery" | "activity", { icon: string; name: string; sub: string; value: string }[]>;
}

export interface ResultDTO {
  id: string;
  code: string;
  name: string;
  fullName: string | null;
  category: string;
  value: number | null;
  valueText: string | null;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  refText: string | null;
  inRange: boolean | null;
  collectedAt: string | null;
  source: string;
  about: string | null;
  guidance: string | null;
  history: { date: string; value: number }[];
  pending: boolean;
  expectedAt: string | null;
}

export interface ResultsDTO { latestLabel: string | null; results: ResultDTO[] }

export interface ProtocolItemDTO {
  id: string; slot: string; title: string; dose: string; source: string; timeOfDay: string | null;
  sections: { h: string; t: string }[]; guidance: string | null; doneToday: boolean;
}
export interface ProtocolDTO { items: ProtocolItemDTO[]; streak: number }

export interface HistoryItemDTO {
  id: string;
  ref: { type: "symptom" | "alba" | "assessment" | "labcheck" | "referral" | "labs" | "protocol" | "appointment"; id: string };
  kind: string; // filter keys, space-separated
  type: string;
  title: string;
  sub: string;
  icon: string;
  ai: boolean;
  at: string; // ISO
  go: "results" | "protocol" | "appointments" | "referrals" | null;
}

export interface HistoryDetailDTO {
  eyebrow: string;
  title: string;
  dateLabel: string;
  sections: { h: string; t: string }[];
  messages?: { role: "user" | "assistant"; text: string }[];
  note: string;
}

export interface AppointmentDTO {
  id: string; title: string; clinician: string; location: string; startsAt: string; durationMin: number;
  status: string; summaryAvailable: boolean; rescheduleRequested: boolean; prepSaved: boolean; questionCount: number;
  prep: { shareTrends: boolean; shareResults: boolean; shareSymptoms: boolean };
}
export interface AppointmentsDTO {
  upcoming: AppointmentDTO[];
  past: AppointmentDTO[];
  questions: { id: string; text: string }[];
  prepSources: { trends: boolean; results: string | null; symptom: { label: string; sub: string } | null };
}

export interface ReferralDTO { id: string; title: string; status: string; steps: { label: string; date: string; done: boolean }[]; appointmentId: string | null }

export interface DeviceDTO {
  id: ProviderId; name: string; icon: string; signals: string[]; available: boolean;
  status: "off" | "pending" | "on"; lastSyncAt: string | null; dataTypes: string[]; tokenHint: string | null;
}

export interface SettingsDTO {
  shareWearables: boolean; shareLabs: boolean; shareRecords: boolean; albaAccess: boolean;
  notifDaily: boolean; notifWorth: boolean; notifProtocol: boolean; notifAppt: boolean;
}

export interface BootstrapDTO { profile: ProfileDTO; today: TodayDTO; settings: SettingsDTO }
