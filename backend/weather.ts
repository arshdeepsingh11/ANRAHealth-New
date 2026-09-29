// Weather and air quality for the daily brief — Environment and Climate
// Change Canada (MSC GeoMet OGC API, api.weather.gc.ca). Free, open licence,
// attribution: "Data Source: Environment and Climate Change Canada".
// Cached in memory for 30 minutes per city. Never throws: the brief works
// without weather.

import type { WeatherDTO } from "@/lib/portal/types";
import type { Place } from "@/lib/portal/places";

const API = "https://api.weather.gc.ca/collections";
const TTL = 30 * 60_000;
const cache = new Map<string, { at: number; data: WeatherDTO | null }>();
type Fetch = typeof fetch;

// GeoMet values are often bilingual/nested: { value: { en: 12 } } or { en: "Sunny" }.
export function txt(x: any): string | number | null {
  if (x == null) return null;
  if (typeof x === "string" || typeof x === "number") return x;
  if (Array.isArray(x)) return x.length ? txt(x[0]) : null;
  if (typeof x === "object") {
    if ("en" in x) return txt(x.en);
    if ("value" in x) return txt(x.value);
    if ("#text" in x) return txt(x["#text"]);
  }
  return null;
}
const num = (x: any): number | null => { const v = txt(x); const n = typeof v === "number" ? v : v == null || v === "" ? NaN : Number(v); return isFinite(n) ? n : null; };
const str = (x: any): string | null => { const v = txt(x); return v == null || v === "" ? null : String(v); };

export const aqhiRisk = (v: number | null) => (v == null ? null : v <= 3 ? "Low" : v <= 6 ? "Moderate" : v <= 10 ? "High" : "Very high");

const dist = (g: any, lat: number, lon: number) => {
  const c = g?.geometry?.coordinates;
  if (!Array.isArray(c) || typeof c[0] !== "number") return 1e9;
  return (c[1] - lat) ** 2 + (c[0] - lon) ** 2;
};
const nearest = (fs: any[], lat: number, lon: number) => [...fs].sort((a, b) => dist(a, lat, lon) - dist(b, lat, lon))[0];

/** City page (current conditions + forecast + warnings) → partial WeatherDTO. */
export function parseCityPage(j: any, lat: number, lon: number): Partial<WeatherDTO> {
  const f = nearest(j?.features || [], lat, lon);
  const p = f?.properties;
  if (!p) return {};
  const cc = p.currentConditions || {};
  const fc: any[] = p.forecastGroup?.forecasts || p.forecastGroup?.forecast || [];
  let high: number | null = null, low: number | null = null, uv: number | null = null;
  for (const x of fc.slice(0, 2)) {
    const t = x?.temperatures?.temperature ?? x?.temperatures;
    (Array.isArray(t) ? t : t ? [t] : []).forEach((y: any) => {
      const cls = String(txt(y?.class) || "").toLowerCase();
      if (cls === "high" && high == null) high = num(y);
      if (cls === "low" && low == null) low = num(y);
    });
    if (uv == null && x?.uv) uv = num(x.uv.index ?? x.uv);
  }
  const alerts: string[] = [];
  const walk = (w: any) => {
    if (!w) return;
    if (Array.isArray(w)) return w.forEach(walk);
    if (typeof w === "object") {
      const d = str(w.description) || (typeof w.event === "object" && !Array.isArray(w.event) ? str(w.event.description) : null);
      if (d && !/no watches or warnings/i.test(d)) alerts.push(d.replace(/\s+/g, " ").trim());
      if (w.event && (Array.isArray(w.event) || !str(w.event?.description))) walk(w.event);
      if (w.events) walk(w.events);
    }
  };
  walk(p.warnings);
  return {
    tempC: num(cc.temperature), condition: str(cc.condition), feelsLikeC: num(cc.windChill) ?? num(cc.humidex),
    windKmh: num(cc.wind?.speed), high, low, uv, alerts: [...new Set(alerts)].slice(0, 3),
  };
}

export function parseAqhi(obs: any, fcst: any, lat: number, lon: number, now = new Date()): Pick<WeatherDTO, "aqhi" | "aqhiMax" | "aqhiRisk"> {
  const o = nearest((obs?.features || []).filter((x: any) => num(x?.properties?.aqhi) != null), lat, lon);
  let aqhi = o ? num(o.properties.aqhi) : null;
  const loc = o?.properties?.location_id;
  const horizon = now.getTime() + 14 * 3600_000;
  const future = (fcst?.features || []).filter((x: any) => {
    const t = new Date(String(x?.properties?.forecast_datetime || "")).getTime();
    return num(x?.properties?.aqhi) != null && t >= now.getTime() - 3600_000 && t <= horizon && (!loc || !x.properties.location_id || x.properties.location_id === loc || dist(x, lat, lon) < 0.5);
  });
  const aqhiMax = future.length ? Math.max(...future.map((x: any) => num(x.properties.aqhi)!)) : null;
  if (aqhi == null && future.length) aqhi = num(future[0].properties.aqhi);
  if (aqhi != null) aqhi = Math.round(aqhi);
  return { aqhi, aqhiMax: aqhiMax != null ? Math.round(aqhiMax) : null, aqhiRisk: aqhiRisk(Math.max(aqhi ?? 0, aqhiMax ?? 0) || null) };
}

const MOCK: Omit<WeatherDTO, "place" | "updatedAt"> = { tempC: 14, condition: "Sunny", high: 19, low: 4, windKmh: 12, feelsLikeC: null, uv: 4, aqhi: 2, aqhiMax: 3, aqhiRisk: "Low", alerts: [] };

export async function getWeather(place: Place, f: Fetch = fetch): Promise<WeatherDTO | null> {
  const key = `${place.city}|${place.prov}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const label = `${place.city}, ${place.prov}`;
  if (process.env.WEATHER_MOCK === "1") return { place: label, updatedAt: new Date().toISOString(), ...MOCK };

  const { lat, lon } = place;
  const bbox = (d: number) => `${(lon - d).toFixed(3)},${(lat - d).toFixed(3)},${(lon + d).toFixed(3)},${(lat + d).toFixed(3)}`;
  const get = (u: string) => f(u, { headers: { Accept: "application/geo+json, application/json" }, signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [city, obs, fcst] = await Promise.all([
    get(`${API}/citypageweather-realtime/items?f=json&lang=en&limit=10&bbox=${bbox(0.6)}`),
    get(`${API}/aqhi-observations-realtime/items?f=json&limit=40&sortby=-observation_datetime&bbox=${bbox(0.8)}`),
    get(`${API}/aqhi-forecasts-realtime/items?f=json&limit=120&sortby=-publication_datetime&bbox=${bbox(0.8)}`),
  ]);
  let data: WeatherDTO | null = null;
  if (city || obs || fcst) {
    const cp = city ? parseCityPage(city, lat, lon) : {};
    const aq = parseAqhi(obs, fcst, lat, lon);
    data = { place: label, tempC: null, condition: null, high: null, low: null, windKmh: null, feelsLikeC: null, uv: null, alerts: [], ...cp, ...aq, updatedAt: new Date().toISOString() };
    if (data.tempC == null && data.aqhi == null && data.condition == null) data = null;
  }
  cache.set(key, { at: Date.now(), data });
  return data;
}
