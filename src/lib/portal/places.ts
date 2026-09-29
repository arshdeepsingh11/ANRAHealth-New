// Canadian cities for the daily brief (weather + air quality). Patients pick
// one, or share their location and the nearest city is chosen — no
// geocoding service needed.

export interface Place { city: string; prov: string; lat: number; lon: number }

export const PLACES: Place[] = [
  { city: "Calgary", prov: "AB", lat: 51.0447, lon: -114.0719 },
  { city: "Edmonton", prov: "AB", lat: 53.5461, lon: -113.4938 },
  { city: "Red Deer", prov: "AB", lat: 52.2681, lon: -113.8112 },
  { city: "Lethbridge", prov: "AB", lat: 49.6956, lon: -112.8451 },
  { city: "Medicine Hat", prov: "AB", lat: 50.0405, lon: -110.6765 },
  { city: "Airdrie", prov: "AB", lat: 51.2917, lon: -114.0144 },
  { city: "Cochrane", prov: "AB", lat: 51.1894, lon: -114.4676 },
  { city: "Okotoks", prov: "AB", lat: 50.7256, lon: -113.9749 },
  { city: "Canmore", prov: "AB", lat: 51.0884, lon: -115.3479 },
  { city: "Banff", prov: "AB", lat: 51.1784, lon: -115.5708 },
  { city: "Grande Prairie", prov: "AB", lat: 55.1707, lon: -118.7947 },
  { city: "Fort McMurray", prov: "AB", lat: 56.7267, lon: -111.381 },
  { city: "Vancouver", prov: "BC", lat: 49.2827, lon: -123.1207 },
  { city: "Victoria", prov: "BC", lat: 48.4284, lon: -123.3656 },
  { city: "Kelowna", prov: "BC", lat: 49.888, lon: -119.496 },
  { city: "Kamloops", prov: "BC", lat: 50.6745, lon: -120.3273 },
  { city: "Prince George", prov: "BC", lat: 53.9171, lon: -122.7497 },
  { city: "Surrey", prov: "BC", lat: 49.1913, lon: -122.849 },
  { city: "Saskatoon", prov: "SK", lat: 52.1579, lon: -106.6702 },
  { city: "Regina", prov: "SK", lat: 50.4452, lon: -104.6189 },
  { city: "Winnipeg", prov: "MB", lat: 49.8951, lon: -97.1384 },
  { city: "Brandon", prov: "MB", lat: 49.8485, lon: -99.95 },
  { city: "Toronto", prov: "ON", lat: 43.6532, lon: -79.3832 },
  { city: "Ottawa", prov: "ON", lat: 45.4215, lon: -75.6972 },
  { city: "Mississauga", prov: "ON", lat: 43.589, lon: -79.6441 },
  { city: "Brampton", prov: "ON", lat: 43.7315, lon: -79.7624 },
  { city: "Hamilton", prov: "ON", lat: 43.2557, lon: -79.8711 },
  { city: "London", prov: "ON", lat: 42.9849, lon: -81.2453 },
  { city: "Kitchener", prov: "ON", lat: 43.4516, lon: -80.4925 },
  { city: "Windsor", prov: "ON", lat: 42.3149, lon: -83.0364 },
  { city: "Sudbury", prov: "ON", lat: 46.4917, lon: -80.993 },
  { city: "Thunder Bay", prov: "ON", lat: 48.3809, lon: -89.2477 },
  { city: "Kingston", prov: "ON", lat: 44.2312, lon: -76.486 },
  { city: "Montréal", prov: "QC", lat: 45.5017, lon: -73.5673 },
  { city: "Québec", prov: "QC", lat: 46.8139, lon: -71.208 },
  { city: "Gatineau", prov: "QC", lat: 45.4765, lon: -75.7013 },
  { city: "Sherbrooke", prov: "QC", lat: 45.4042, lon: -71.8929 },
  { city: "Halifax", prov: "NS", lat: 44.6488, lon: -63.5752 },
  { city: "Moncton", prov: "NB", lat: 46.0878, lon: -64.7782 },
  { city: "Fredericton", prov: "NB", lat: 45.9636, lon: -66.6431 },
  { city: "Saint John", prov: "NB", lat: 45.2733, lon: -66.0633 },
  { city: "Charlottetown", prov: "PE", lat: 46.2382, lon: -63.1311 },
  { city: "St. John's", prov: "NL", lat: 47.5615, lon: -52.7126 },
  { city: "Whitehorse", prov: "YT", lat: 60.7212, lon: -135.0568 },
  { city: "Yellowknife", prov: "NT", lat: 62.454, lon: -114.3718 },
  { city: "Iqaluit", prov: "NU", lat: 63.7467, lon: -68.517 },
];

export function nearestPlace(lat: number, lon: number): Place {
  let best = PLACES[0], bd = Infinity;
  for (const p of PLACES) {
    const d = (p.lat - lat) ** 2 + ((p.lon - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

export const findPlace = (city: string, prov?: string | null) =>
  PLACES.find((p) => p.city.toLowerCase() === city.trim().toLowerCase() && (!prov || p.prov === prov)) || null;
