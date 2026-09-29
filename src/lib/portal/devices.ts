import type { ProviderId } from "./types";
import type { MetricKey } from "./metrics";

// Every health source My Health Space knows about, and how it connects.
//   shortcut — Apple Health on iPhone sends a daily summary through a private
//              Shortcut + sync token (no app needed).
//   oauth    — one-time sign-in with the maker (Withings, Oura, WHOOP); ANRA
//              then pulls new data every day. Live only when the clinic has
//              set that maker's client id/secret on the server.
//   waitlist — not open yet (maker's program closed or our app not ready);
//              patients can ask to be told when it opens.
// The guide text is shown in the Connect sheet before anything happens.

export type ConnectMode = "shortcut" | "oauth" | "waitlist";
export interface DeviceGuide { needs: string; steps: string[]; meanwhile?: string; note?: string }
export interface CatalogDevice {
  id: ProviderId; name: string; icon: string; blurb: string; mode: ConnectMode; beta?: boolean;
  signals: { label: string; metrics: MetricKey[] }[];
  guide: DeviceGuide;
}

const SLEEP: MetricKey[] = ["sleep", "bedtime", "timeInBed", "sleepVar"];
const ACTIVITY: MetricKey[] = ["steps", "active", "workouts", "activeEnergy", "distance"];

export const DEVICE_CATALOG: CatalogDevice[] = [
  { id: "iphone", name: "iPhone (Apple Health)", icon: "ph ph-device-mobile", mode: "shortcut",
    blurb: "No watch needed. Your iPhone already counts steps, distance and workouts, and keeps sleep and readings you add to the Health app.",
    signals: [
      { label: "Activity", metrics: ACTIVITY },
      { label: "Sleep", metrics: SLEEP },
      { label: "Blood pressure", metrics: ["bp"] },
      { label: "Weight", metrics: ["weight"] },
      { label: "Blood glucose", metrics: ["glucose"] },
    ],
    guide: {
      needs: "An iPhone with the Health and Shortcuts apps (built in).",
      steps: [
        "Tap Connect. You'll get a private sync token — copy it.",
        "On your iPhone open Shortcuts → Automation → New Automation → Time of Day (8:00 AM, Daily, Run Immediately).",
        "Add Find Health Samples for Steps, Walking + Running Distance, Exercise Minutes and Sleep (today / last night).",
        "Add Get Contents of URL with the address shown, Method POST, header Authorization = Bearer + your token, and a JSON body (keys shown after you connect).",
        "Run it once. This card turns Connected after the first sync. After that ANRA gets your summary every morning.",
      ],
      note: "Sleep appears if you use Sleep Schedule or a sleep app that writes to Health. Heart rate variability and blood oxygen need an Apple Watch.",
    } },
  { id: "apple", name: "Apple Watch", icon: "ph ph-watch", mode: "shortcut",
    blurb: "Heart, recovery, sleep and activity from your watch, sent through Apple Health on your iPhone.",
    signals: [
      { label: "Heart rate", metrics: ["rhr", "spo2", "bp"] },
      { label: "HRV", metrics: ["hrv"] },
      { label: "Sleep", metrics: SLEEP },
      { label: "Activity", metrics: ACTIVITY },
      { label: "ECG where supported", metrics: ["ecg"] },
    ],
    guide: {
      needs: "Apple Watch paired with your iPhone, plus the Shortcuts app.",
      steps: [
        "Tap Connect. You'll get a private sync token — copy it.",
        "On your iPhone open Shortcuts → Automation → New Automation → Time of Day (8:00 AM, Daily, Run Immediately).",
        "Add Find Health Samples for Resting Heart Rate, Heart Rate Variability, Sleep, Steps, Exercise Minutes and Blood Oxygen.",
        "Add Get Contents of URL with the address shown, Method POST, header Authorization = Bearer + your token, and a JSON body (keys shown after you connect).",
        "Run it once. This card turns Connected after the first sync.",
      ],
    } },
  { id: "withings", name: "Withings", icon: "ph ph-heartbeat", mode: "oauth",
    blurb: "Home blood pressure monitors (BPM) and smart scales. The easiest way to track home BP.",
    signals: [{ label: "Blood pressure", metrics: ["bp"] }, { label: "Weight", metrics: ["weight"] }],
    guide: {
      needs: "A Withings account with your blood pressure monitor or scale set up in the Withings app.",
      steps: ["Tap Connect with Withings.", "Sign in to Withings and allow ANRA Health to read your measurements.", "You come back here automatically. ANRA pulls your new readings every morning — nothing else to do."],
      meanwhile: "Any home BP monitor works: add readings in Heart → Add reading.",
    } },
  { id: "oura", name: "Oura", icon: "ph ph-circle", mode: "oauth",
    blurb: "Sleep, readiness, HRV and resting heart rate from your ring.",
    signals: [{ label: "Sleep", metrics: SLEEP }, { label: "HRV", metrics: ["hrv"] }, { label: "Resting heart rate", metrics: ["rhr"] }, { label: "Activity", metrics: ["steps", "active", "activeEnergy"] }, { label: "Blood oxygen", metrics: ["spo2"] }],
    guide: {
      needs: "An Oura account (the Oura app on your phone).",
      steps: ["Tap Connect with Oura.", "Sign in to Oura and allow ANRA Health.", "You come back here automatically. ANRA pulls last night's data every morning."],
      meanwhile: "On iPhone, Oura can write to Apple Health (Oura app → Settings → Apple Health). Then connect iPhone here.",
    } },
  { id: "whoop", name: "WHOOP", icon: "ph ph-waveform", mode: "oauth", beta: true,
    blurb: "Recovery, HRV, resting heart rate and sleep.",
    signals: [{ label: "Recovery", metrics: ["hrv", "rhr"] }, { label: "Sleep", metrics: SLEEP }, { label: "Blood oxygen", metrics: ["spo2"] }],
    guide: {
      needs: "A WHOOP membership and the WHOOP app.",
      steps: ["Tap Connect with WHOOP.", "Sign in to WHOOP and allow ANRA Health.", "You come back here automatically. ANRA pulls each new recovery and sleep every morning."],
      meanwhile: "On iPhone, WHOOP can write to Apple Health (WHOOP app → Integrations). Then connect iPhone here.",
    } },
  { id: "garmin", name: "Garmin", icon: "ph ph-compass", mode: "waitlist",
    blurb: "Heart rate, activity, sleep and training.",
    signals: [{ label: "Heart rate", metrics: ["rhr"] }, { label: "Activity", metrics: ACTIVITY }, { label: "Sleep", metrics: SLEEP }],
    guide: {
      needs: "A Garmin Connect account.",
      steps: ["Garmin's partner program isn't taking new companies right now. Tap Notify me and we'll tell you the day it opens."],
      meanwhile: "On iPhone: Garmin Connect app → More → Settings → Connected Apps → Apple Health, turn on. Then connect iPhone here — your Garmin steps, sleep and heart data come through.",
    } },
  { id: "fitbit", name: "Fitbit / Pixel Watch", icon: "ph ph-person-simple-run", mode: "waitlist",
    blurb: "Activity, sleep and heart rate.",
    signals: [{ label: "Activity", metrics: ["steps", "active", "activeEnergy"] }, { label: "Heart rate", metrics: ["rhr", "hrv"] }, { label: "Sleep", metrics: SLEEP }],
    guide: {
      needs: "A Google account with Fitbit.",
      steps: ["Fitbit is moving to Google's new Health API. We're completing Google's review. Tap Notify me and we'll tell you when it's ready."],
      meanwhile: "Import a CSV export from your Fitbit account, or enter readings yourself.",
    } },
  { id: "android", name: "Android (Health Connect)", icon: "ph ph-android-logo", mode: "waitlist",
    blurb: "Samsung Health, Google and other Android apps through Health Connect.",
    signals: [{ label: "Activity", metrics: ACTIVITY }, { label: "Heart rate", metrics: ["rhr", "hrv"] }, { label: "Sleep", metrics: SLEEP }, { label: "Blood pressure", metrics: ["bp"] }, { label: "Weight", metrics: ["weight"] }],
    guide: {
      needs: "An Android phone with Health Connect.",
      steps: ["Health Connect only works from an app on the phone. The ANRA Android app is in development — tap Notify me and we'll tell you when it's in Google Play."],
      meanwhile: "Import a CSV file or enter readings yourself.",
    } },
];

export const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(DEVICE_CATALOG.map((d) => [d.id, d.name]));
PROVIDER_NAMES.apple = "Apple Watch";
PROVIDER_NAMES.gfit = "Google Fit";
PROVIDER_NAMES.clinic = "ANRA clinic";
PROVIDER_NAMES.manual = "Entered by you";
PROVIDER_NAMES.import = "Imported file";

/** Sources that count as "wearables" for the Privacy & Data switch. */
export const WEARABLE_SOURCES = ["apple", "iphone", "withings", "oura", "whoop", "garmin", "fitbit", "android", "gfit"];

/** Metrics a device may write, given the signal labels the patient allows. */
export function allowedMetrics(provider: ProviderId, dataTypes: string[]): Set<MetricKey> {
  const dev = DEVICE_CATALOG.find((d) => d.id === provider);
  const out = new Set<MetricKey>();
  dev?.signals.forEach((s) => { if (dataTypes.includes(s.label)) s.metrics.forEach((m) => out.add(m)); });
  // Older rows stored metric keys ("rhr", "sleep") instead of signal labels.
  dataTypes.forEach((k) => { if (dev?.signals.some((s) => s.metrics.includes(k as MetricKey))) out.add(k as MetricKey); });
  return out;
}

/** Signal labels shared, accepting labels or (older rows) metric keys. */
export function sharedLabels(provider: ProviderId, dataTypes: string[]): string[] {
  const dev = DEVICE_CATALOG.find((d) => d.id === provider);
  return (dev?.signals || []).filter((s) => dataTypes.includes(s.label) || s.metrics.some((m) => dataTypes.includes(m))).map((s) => s.label);
}
