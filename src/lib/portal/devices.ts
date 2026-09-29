import type { ProviderId } from "./types";
import type { MetricKey } from "./metrics";

// Supported wearable sources. `available: false` = shown, but connection is
// not live yet (Google Fit is next per the My Health Space plan).
export const DEVICE_CATALOG: { id: ProviderId; name: string; icon: string; signals: { label: string; metrics: MetricKey[] }[]; available: boolean }[] = [
  { id: "apple", name: "Apple Watch", icon: "ph ph-watch", available: true, signals: [
    { label: "Heart rate", metrics: ["rhr", "spo2", "bp"] },
    { label: "HRV", metrics: ["hrv"] },
    { label: "Sleep", metrics: ["sleep", "bedtime", "timeInBed", "sleepVar"] },
    { label: "Activity", metrics: ["steps", "active", "workouts", "activeEnergy"] },
    { label: "ECG where supported", metrics: ["ecg"] },
  ] },
  { id: "oura", name: "Oura", icon: "ph ph-circle", available: false, signals: [
    { label: "Sleep", metrics: ["sleep", "bedtime", "timeInBed", "sleepVar"] }, { label: "Recovery", metrics: [] }, { label: "HRV", metrics: ["hrv"] }, { label: "Resting heart rate", metrics: ["rhr"] },
  ] },
  { id: "whoop", name: "WHOOP", icon: "ph ph-waveform", available: false, signals: [
    { label: "Recovery", metrics: [] }, { label: "Sleep", metrics: ["sleep", "bedtime", "timeInBed", "sleepVar"] }, { label: "Strain", metrics: [] }, { label: "HRV", metrics: ["hrv"] },
  ] },
  { id: "garmin", name: "Garmin", icon: "ph ph-compass", available: false, signals: [
    { label: "Heart rate", metrics: ["rhr"] }, { label: "Activity", metrics: ["steps", "active", "workouts", "activeEnergy"] }, { label: "Sleep", metrics: ["sleep", "bedtime", "timeInBed", "sleepVar"] }, { label: "Training", metrics: [] },
  ] },
  { id: "gfit", name: "Google Fit", icon: "ph ph-person-simple-walk", available: false, signals: [
    { label: "Activity", metrics: ["steps", "active", "activeEnergy"] }, { label: "Heart rate", metrics: ["rhr"] }, { label: "Sleep where available", metrics: ["sleep", "bedtime"] },
  ] },
];

export const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(DEVICE_CATALOG.map((d) => [d.id, d.name]));
PROVIDER_NAMES.clinic = "ANRA clinic";
PROVIDER_NAMES.manual = "Entered by you";

/** Metrics a device may write, given the signal labels the patient allows. */
export function allowedMetrics(provider: ProviderId, dataTypes: string[]): Set<MetricKey> {
  const dev = DEVICE_CATALOG.find((d) => d.id === provider);
  const out = new Set<MetricKey>();
  dev?.signals.forEach((s) => { if (dataTypes.includes(s.label)) s.metrics.forEach((m) => out.add(m)); });
  return out;
}
