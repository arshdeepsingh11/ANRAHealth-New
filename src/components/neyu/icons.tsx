// NEYU icon set — one family, drawn for this site: 24-unit grid, 1.5 stroke,
// round caps and joins, no fills. Every content icon on the NEYU pages comes
// from here, so cards, networks and menus all read as one calm system.
import React, { useId } from "react";

// Each icon: path data (strokes), plus optional circles [cx, cy, r] and dots (filled, tiny).
type Glyph = { d?: string; c?: [number, number, number][]; dot?: [number, number][] };

export const GLYPHS: Record<string, Glyph> = {
  // Body & specialties
  heart: { d: "M12 19.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6z" },
  heartPulse: { d: "M12 19.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6zM7.2 12.2h2.2l1.2-2.1 1.9 3.9 1.2-1.8h3.1" },
  pulse: { d: "M3 12.5h4l2.2-5.5 4.2 11 2.3-5.5H21" },
  stethoscope: { d: "M5.5 3.5h1.6M12.9 3.5h1.6M6.3 3.5v4.6a3.7 3.7 0 0 0 7.4 0V3.5M10 11.8v2.7a4.5 4.5 0 0 0 9 0v-1.6", c: [[19, 11, 1.9]] },
  lungs: { d: "M12 4v7.5M12 9.5c-1.6 0-2.9-1-3.8-2.6C6 9 4.5 12.6 4.5 16.2c0 1.9 1 3 2.8 3 2.3 0 4.7-1.3 4.7-4.6M12 9.5c1.6 0 2.9-1 3.8-2.6 2.2 2.1 3.7 5.7 3.7 9.3 0 1.9-1 3-2.8 3-2.3 0-4.7-1.3-4.7-4.6" },
  kidney: { d: "M15.2 4.2c2.8 0 4.8 3.1 4.8 7.2s-2 7.6-4.8 7.6c-1.9 0-2.9-1.4-2.9-3.2 0-1.5 1-2.4 1-4.3s-1-2.4-1-3.9c0-2 1.2-3.4 2.9-3.4zM12.6 12.4H9.4c-1.6 0-2.6 1-2.6 2.6v5" },
  brain: { d: "M12 5.2v13.6M12 5.2a2.9 2.9 0 0 0-5.3 1.3 2.9 2.9 0 0 0-2 4.3 2.9 2.9 0 0 0 .9 4.6 2.9 2.9 0 0 0 3.3 3.6A2.9 2.9 0 0 0 12 18.8M12 5.2a2.9 2.9 0 0 1 5.3 1.3 2.9 2.9 0 0 1 2 4.3 2.9 2.9 0 0 1-.9 4.6 2.9 2.9 0 0 1-3.3 3.6A2.9 2.9 0 0 1 12 18.8M8.5 10.5h1.6M13.9 13.5h1.6" },
  dna: { d: "M7.5 3.5c0 4.6 9 4.4 9 8.5s-9 3.9-9 8.5M16.5 3.5c0 4.6-9 4.4-9 8.5s9 3.9 9 8.5M8.3 5.2h7.4M8.7 10.4h6.6M8.7 13.6h6.6M8.3 18.8h7.4" },
  hormone: { d: "M12 3.8l7 4.1v8.2l-7 4.1-7-4.1V7.9z", c: [[12, 12, 2.6]] },
  joint: { d: "M8.8 3.5v5.9a3.2 3.2 0 0 0 6.4 0V3.5M8.8 20.5v-5.2a3.2 3.2 0 0 1 6.4 0v5.2M6.5 12h1.2M16.3 12h1.2" },
  child: { d: "M9.2 20.5l.9-5.3M14.8 20.5l-.9-5.3M6.8 11l5.2 1.6 5.2-1.6M12 12.6v2.6M10.1 15.2h3.8", c: [[12, 6.6, 2.6]] },
  elder: { d: "M10.5 21l.8-6.2-2.3-2.4 1.3-3.6h3.4l1.6 3.4M14.6 21l-1.2-5.2M17 12.2l1.6 8.8", c: [[12.2, 5.4, 2]] },
  apple: { d: "M12 7.4c-1-1.4-2.9-1.9-4.3-1.3C5.4 7 4.9 10.3 5.8 13.6c.9 3.2 2.8 6.1 4.2 6.1.9 0 1.3-.5 2-.5s1.1.5 2 .5c1.4 0 3.3-2.9 4.2-6.1.9-3.3.4-6.6-1.9-7.5-1.4-.6-3.3-.1-4.3 1.3zM12 7.4c0-1.8.9-3.2 2.8-3.9" },
  skin: { d: "M3.5 10.5c2-1.6 3.6-1.6 5.6 0s3.6 1.6 5.6 0 3.6-1.6 5.8 0M3.5 15c2-1.6 3.6-1.6 5.6 0s3.6 1.6 5.6 0 3.6-1.6 5.8 0M3.5 19.5h17M8.5 10V4.5M15.5 10V6.5", dot: [[15.5, 4.6]] },
  thyroid: { d: "M12 7.2v3.2M12 10.4c-.9-2.6-2.6-4.4-4.6-4.4C5.4 6 4 7.9 4 10.6 4 14.2 6.4 17.6 9 18c1.7.3 2.8-1.2 3-3.2.2 2 1.3 3.5 3 3.2 2.6-.4 5-3.8 5-7.4C20 7.9 18.6 6 16.6 6c-2 0-3.7 1.8-4.6 4.4zM10 4.2h4" },
  dumbbell: { d: "M6.5 8v8M17.5 8v8M4 10v4M20 10v4M6.5 12h11" },
  wind: { d: "M3.5 9h10.8a2.8 2.8 0 1 0-2.8-2.8M3.5 15h14a2.8 2.8 0 1 1-2.8 2.8M3.5 12H10" },
  drop: { d: "M12 3.8s6 6.3 6 10.6a6 6 0 0 1-12 0c0-4.3 6-10.6 6-10.6z" },
  bolt: { d: "M13.2 3.5L5.8 13.2h5.6l-.8 7.3 7.6-9.8h-5.7z" },
  moon: { d: "M19.6 14.6A7.9 7.9 0 1 1 9.4 4.4a6.3 6.3 0 0 0 10.2 10.2z" },
  sun: { d: "M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4", c: [[12, 12, 4]] },
  cloud: { d: "M7.4 18.5h9.8a3.9 3.9 0 0 0 .4-7.8 5.4 5.4 0 0 0-10.3 1.4 3.2 3.2 0 0 0 .1 6.4z" },
  leaf: { d: "M12 20.5v-7.6M12 12.9c0-4.2 3-7.3 8-7.3 0 4.1-3 7.3-8 7.3zM12 15.4c0-3.1-2.5-5.6-7-5.6 0 3.1 2.5 5.6 7 5.6z" },
  hourglass: { d: "M7 3.5h10M7 20.5h10M8 3.5c0 5 8 5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5-8 8.5s8 3.5 8 8.5" },
  cell: { c: [[12, 12, 8.2], [12, 12, 3]], dot: [[7.6, 9], [16.4, 15.4], [15.6, 7.8]] },
  microbiome: { c: [[8.2, 8.6, 3], [15.6, 7.6, 2.1], [15.2, 15.4, 3.4], [7.6, 16.2, 1.8]] },
  pill: { d: "M10.4 3.9a4.9 4.9 0 0 1 6.9 6.9l-6.6 6.6a4.9 4.9 0 0 1-6.9-6.9zM7.4 7.4l6.9 6.9" },
  flask: { d: "M9 3.5h6M10 3.5v6l-5 8.8a1.8 1.8 0 0 0 1.6 2.7h10.8a1.8 1.8 0 0 0 1.6-2.7l-5-8.8v-6M7.4 15h9.2" },
  tube: { d: "M14.5 3.5l6 6M16 5L6.6 14.4a3.2 3.2 0 0 0 4.5 4.5L20.5 9.5M9 12h5.5" },
  microscope: { d: "M5 20.5h14M9 17.5h7M12.5 17.5v-3M8.6 4.2l4.4 7.6M7.1 5.1l2.9-1.7M11.6 12.4l2.2-1.3M14.8 16.2a5.3 5.3 0 0 0 .8-9.4" },
  echo: { d: "M12 4.5L4.6 17.4a12.5 12.5 0 0 0 14.8 0zM8.6 14.6a5.6 5.6 0 0 0 6.8 0M10.1 11.6a3 3 0 0 0 3.8 0" },
  monitor: { d: "M4.5 5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8.5 20h7M12 16.5V20M6.8 11h2.4l1.4-2.4 2 4.6 1.4-2.2h3.2" },
  vessel: { d: "M3.5 17.5c4.5-.6 5.6-3.8 7.5-6.8s3.8-5.6 9.5-6.2M3.5 21c5.2-.6 7.1-3.9 9-6.9s3.9-5.3 8-5.9" },
  scan: { d: "M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16" },
  gauge: { d: "M4.4 17a8.3 8.3 0 1 1 15.2 0M12 17l3.6-4.6M5.8 11.2l1.3.7M12 6.3v1.5M18.2 11.2l-1.3.7", c: [[12, 17, 1.4]] },
  watch: { d: "M8.2 7h7.6a1.2 1.2 0 0 1 1.2 1.2v7.6a1.2 1.2 0 0 1-1.2 1.2H8.2A1.2 1.2 0 0 1 7 15.8V8.2A1.2 1.2 0 0 1 8.2 7zM9.2 7l.7-3.5h4.2l.7 3.5M9.2 17l.7 3.5h4.2l.7-3.5M9.3 12h1.4l.9-1.6 1.2 3 .9-1.4h1" },
  steps: { d: "M8.2 3.6c1.5 0 2.3 1.7 2.3 3.8s-.8 3.8-2.3 3.8-2.3-1.7-2.3-3.8.8-3.8 2.3-3.8zM6.3 13.6h3.8M15.8 8.6c1.5 0 2.3 1.7 2.3 3.8s-.8 3.8-2.3 3.8-2.3-1.7-2.3-3.8.8-3.8 2.3-3.8zM13.9 18.6h3.8" },
  scale: { d: "M12 4.5v15.5M6.5 20h11M5 8h14M5 8l-2.4 6a2.4 2.4 0 0 0 4.8 0zM19 8l-2.4 6a2.4 2.4 0 0 0 4.8 0z" },
  food: { d: "M3.6 11h16.8a8.4 8.4 0 0 1-16.8 0zM8.5 20h7M9.4 7.6c0-1 1-1.4 1-2.5M13.4 7.6c0-1 1-1.4 1-2.5" },
  noSmoke: { d: "M3.5 14.5h11M17 14.5h3.5v3H17M3.5 17.5h11M3.5 3.5l17 17M17.8 11.5c0-1.6-1.4-2.2-1.4-3.6S17.8 6 17.8 4.5" },
  // People & care
  user: { d: "M5.2 20c0-3.6 3-6.1 6.8-6.1s6.8 2.5 6.8 6.1", c: [[12, 8, 3.6]] },
  users: { d: "M3.6 19.5c0-3 2.4-5.2 5.4-5.2s5.4 2.2 5.4 5.2M15.2 14.5c3 0 5.2 2 5.2 5M15 4.6a3 3 0 0 1 0 6", c: [[9, 7.8, 3.1]] },
  doctor: { d: "M5.2 20c0-3.6 3-6.1 6.8-6.1s6.8 2.5 6.8 6.1M9.6 14.4v2.4a2.4 2.4 0 0 0 4.8 0v-2.4", c: [[12, 7.8, 3.5]] },
  care: { d: "M12 11.6s-3.6-2.2-3.6-5A2 2 0 0 1 12 5.4a2 2 0 0 1 3.6 1.2c0 2.8-3.6 5-3.6 5zM3.5 14.8h3l3 2h4.2a1.5 1.5 0 0 0 0-3h-2.4M6.5 14.8v5.7M13 16.8l5.5-2.5a1.5 1.5 0 0 1 1.5 2.6l-6 3.7H6.5" },
  video: { d: "M4.2 6.5h9.4a1.6 1.6 0 0 1 1.6 1.6v7.8a1.6 1.6 0 0 1-1.6 1.6H4.2a1.6 1.6 0 0 1-1.6-1.6V8.1a1.6 1.6 0 0 1 1.6-1.6zM15.2 10.4l6.2-3.4v10l-6.2-3.4" },
  chat: { d: "M5 4.8h14a1.5 1.5 0 0 1 1.5 1.5v8.4a1.5 1.5 0 0 1-1.5 1.5H10l-5 3.8v-3.8a1.5 1.5 0 0 1-1.5-1.5V6.3A1.5 1.5 0 0 1 5 4.8z", dot: [[8.4, 10.5], [12, 10.5], [15.6, 10.5]] },
  language: { d: "M4 4.5h9.5a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H8.5L5 14.5v-2.5H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1zM16.8 8.5H20a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-1v2.5L15.5 16H11a1 1 0 0 1-1-1v-1" },
  idcard: { d: "M4.5 5.5h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM6.2 16c.5-1.5 1.5-2.1 2.9-2.1s2.4.6 2.9 2.1M14.2 10h4M14.2 13h3", c: [[9.1, 10.6, 1.9]] },
  referral: { d: "M7 3.5h7l4 4V20.5H7zM14 3.5v4h4M9.8 14h5.6M13 11.3l2.5 2.7L13 16.6" },
  // Records, data & AI
  doc: { d: "M7 3.5h7l4 4V20.5H7zM14 3.5v4h4M9.6 12h5M9.6 15.5h5" },
  folder: { d: "M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5zM8 13.5h2l1-1.7 1.5 3.4 1-1.7h2.5" },
  layers: { d: "M12 4l8.5 4.5L12 13 3.5 8.5zM3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5" },
  chart: { d: "M4 4v16h16M7.5 15l3.4-4 3 2.5 5.1-6" },
  trend: { d: "M4 17l5.5-5.5 3.5 3.5L20 8M15 8h5v5" },
  bars: { d: "M5.5 20v-7M10 20V6.5M14.5 20v-9.5M19 20V9" },
  network: { d: "M7.9 7.2l7.3 1.4M7.3 8.6l2.2 7.6M16.4 10.2l-4.6 6.3", c: [[6.4, 6.6, 2.2], [17.6, 8.8, 2.2], [10.4, 18, 2.2]] },
  link: { d: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" },
  spark: { d: "M11 4c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6zM18 14.6c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z" },
  search: { d: "M16 16l4.5 4.5", c: [[11, 11, 6.5]] },
  compass: { d: "M15.4 8.6l-2 5-4.8 1.8 2-5z", c: [[12, 12, 8.5]] },
  target: { c: [[12, 12, 8.5], [12, 12, 4.6]], dot: [[12, 12]] },
  loop: { d: "M19.8 12a7.8 7.8 0 0 1-13.6 5.2M4.2 12A7.8 7.8 0 0 1 17.8 6.8M18 3.5v3.6h-3.6M6 20.5v-3.6h3.6" },
  eye: { d: "M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z", c: [[12, 12, 2.8]] },
  fingerprint: { d: "M7 18.5c.9-1.8 1.4-3.8 1.4-6.1a3.6 3.6 0 0 1 7.2 0c0 1.6-.2 3.1-.6 4.6M12 12.4c0 3.1-.8 5.9-2.4 8.1M5.2 15.3c.4-.9.6-1.9.6-2.9a6.2 6.2 0 0 1 10.6-4.4M18.2 11.4c.1.3.1.7.1 1 0 2.9-.5 5.6-1.5 8" },
  lock: { d: "M6.5 11h11v9h-11zM8.8 11V8.2a3.2 3.2 0 0 1 6.4 0V11" },
  shield: { d: "M12 3.5l7 2.8v5.6c0 4.4-2.9 7.4-7 8.6-4.1-1.2-7-4.2-7-8.6V6.3z" },
  shieldCheck: { d: "M12 3.5l7 2.8v5.6c0 4.4-2.9 7.4-7 8.6-4.1-1.2-7-4.2-7-8.6V6.3zM9 12.2l2.1 2.1 4-4.2" },
  check: { d: "M5 12.5l4.5 4.5L19 7.5" },
  plus: { d: "M12 5v14M5 12h14" },
  alert: { d: "M12 4.2l8.6 15.3H3.4zM12 10v4.2", dot: [[12, 16.9]] },
  info: { d: "M12 11v5.5", c: [[12, 12, 8.5]], dot: [[12, 8]] },
  book: { d: "M12 6.5C10.4 5.3 8 4.8 4 4.8v13.4c4 0 6.4.5 8 1.7 1.6-1.2 4-1.7 8-1.7V4.8c-4 0-6.4.5-8 1.7zM12 6.5v13.4" },
  cap: { d: "M2.8 9.5L12 5l9.2 4.5L12 14zM6.5 11.5v4.3c1.5 1.4 3.4 2.2 5.5 2.2s4-.8 5.5-2.2v-4.3M21.2 9.5v5" },
  flag: { d: "M5.5 21V4M5.5 4.5h11.2l-2.2 4 2.2 4H5.5" },
  // Services, places & time
  package: { d: "M12 3.5l8 4.4v8.2l-8 4.4-8-4.4V7.9zM4 7.9l8 4.4 8-4.4M12 12.3v8.2M8 5.7l8 4.4" },
  briefcase: { d: "M5 8h14a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V9.5A1.5 1.5 0 0 1 5 8zM9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2M3.5 13h17" },
  membership: { d: "M12 3.5l7.5 4.3v8.4L12 20.5l-7.5-4.3V7.8zM12 3.5v17M4.5 7.8L19.5 16.2M19.5 7.8L4.5 16.2" },
  tierOne: { d: "M12 4.5l6 6-6 9-6-9zM6 10.5h12" },
  tierTwo: { d: "M9 5.5l5 5-5 7.5-5-7.5zM4 10.5h10M15 5.5l5 5-4.6 6.9" },
  tierThree: { d: "M12 7.5l5 5-5 7.5-5-7.5zM7 12.5h10M6.2 9.6L4 12.2l2.6 3.9M17.8 9.6l2.2 2.6-2.6 3.9M12 3.2v1.6M8.2 4.2l.8 1.4M15.8 4.2l-.8 1.4" },
  home: { d: "M4 11l8-6.5 8 6.5M6 9.4V20h12V9.4M10 20v-5h4v5" },
  homeDrop: { d: "M4 11l8-6.5 8 6.5M6 9.4V20h12V9.4M12 11.6s2.2 2.4 2.2 3.9a2.2 2.2 0 0 1-4.4 0c0-1.5 2.2-3.9 2.2-3.9z" },
  clinic: { d: "M4 20V8.4L12 4l8 4.4V20M2.8 20h18.4M10 20v-4h4v4M12 8v4.4M9.8 10.2h4.4" },
  pin: { d: "M12 21s-6.4-5.9-6.4-11a6.4 6.4 0 0 1 12.8 0c0 5.1-6.4 11-6.4 11z", c: [[12, 10, 2.3]] },
  route: { d: "M8.2 17h6.8a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8", c: [[6, 17, 2.1], [18, 5, 2.1]] },
  phone: { d: "M5.2 4h3.3l1.6 4-2 1.3a10.3 10.3 0 0 0 6.6 6.6l1.3-2 4 1.6v3.3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.7 5.6 1.5 1.5 0 0 1 5.2 4z" },
  mail: { d: "M4.5 6h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.8 7l8.2 6 8.2-6" },
  clock: { d: "M12 7.5V12l3 2", c: [[12, 12, 8.5]] },
  calendar: { d: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8.5 3.5v4M15.5 3.5v4" },
  calendarCheck: { d: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8.5 3.5v4M15.5 3.5v4M9.2 15l2 2 3.8-3.8" },
  car: { d: "M5 16.5V12l1.8-4.4A1.5 1.5 0 0 1 8.2 6.6h7.6a1.5 1.5 0 0 1 1.4 1L19 12v4.5M5 16.5h14M5 12h14", c: [[8, 16.8, 1.6], [16, 16.8, 1.6]] },
  globe: { d: "M3.5 12h17M12 3.5c2.4 2.4 3.5 5.4 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.4-3.5-8.5s1.1-6.1 3.5-8.5z", c: [[12, 12, 8.5]] },
  map: { d: "M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13" },
  arrow: { d: "M5 12h14M13 6l6 6-6 6" },
  arrowDown: { d: "M12 5v14M6 13l6 6 6-6" },
  chevron: { d: "M9 6l6 6-6 6" },
  chevronDown: { d: "M6 9l6 6 6-6" },
  x: { d: "M6.5 6.5l11 11M17.5 6.5l-11 11" },
  minus: { d: "M5 12h14" },
  external: { d: "M14 4.5h5.5V10M19.5 4.5l-8 8M18 13.5v5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" },
  play: { d: "M8 5.5v13l10.5-6.5z" },
  pause: { d: "M8.5 5.5v13M15.5 5.5v13" },
  sound: { d: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" },
  mute: { d: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5" },
  star: { d: "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" },
  award: { d: "M8.5 13.5L7 20.5l5-2.5 5 2.5-1.5-7", c: [[12, 9, 5.5]] },
  sparkle: { d: "M12 3.8c.5 3.6 2 5.1 5.6 5.6-3.6.5-5.1 2-5.6 5.6-.5-3.6-2-5.1-5.6-5.6 3.6-.5 5.1-2 5.6-5.6z" },
  sync: { d: "M9 3.5v4M15 3.5v4M7 7.5h10v3.5a5 5 0 0 1-10 0zM12 16v4.5" },
  mic: { d: "M9 6.5a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0zM5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.7v2.8" },
  camera: { d: "M4.5 7.5h3l1.5-2h6l1.5 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z", c: [[12, 13, 3.4]] },
  upload: { d: "M12 15.5V4.5M7.5 9L12 4.5 16.5 9M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" },
  trial: { d: "M9.5 3.5h5M10.5 3.5v5.8L6 17.6a2 2 0 0 0 1.8 2.9h8.4a2 2 0 0 0 1.8-2.9l-4.5-8.3V3.5", dot: [[10.6, 15.6], [13.6, 17.2]] },
  arrowUp: { d: "M12 19V5M6 11l6-6 6 6" },
  arrowLeft: { d: "M19 12H5M11 6l-6 6 6 6" },
  chevronLeft: { d: "M15 6l-6 6 6 6" },
  chevronUp: { d: "M6 15l6-6 6 6" },
  download: { d: "M12 4.5v11M7.5 11L12 15.5 16.5 11M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" },
  copy: { d: "M9 9h9.5a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM16 9V5.5a1 1 0 0 0-1-1H5.5a1 1 0 0 0-1 1V15a1 1 0 0 0 1 1H8" },
  qr: { d: "M4.5 4.5h5v5h-5zM14.5 4.5h5v5h-5zM4.5 14.5h5v5h-5zM14.5 14.5h2v2M19.5 14.5v5h-5M17 17.5v2" },
  circle: { c: [[12, 12, 8]] },
  xCircle: { d: "M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6", c: [[12, 12, 8.5]] },
  wifi: { d: "M3.8 9.5a12 12 0 0 1 16.4 0M6.6 12.6a8 8 0 0 1 10.8 0M9.4 15.6a4 4 0 0 1 5.2 0", dot: [[12, 18.6]] },
  eyeOff: { d: "M3 12s3.3-6 9-6c1.5 0 2.8.4 4 1M21 12s-3.3 6-9 6c-1.5 0-2.8-.4-4-1M4 4l16 16M10 10a3 3 0 0 0 4 4" },
  micOff: { d: "M9 6.5a3 3 0 0 1 5.6-1.5M15 10v1.5a3 3 0 0 1-4.6 2.5M5.8 11.5a6.2 6.2 0 0 0 10.6 4.4M18.2 11.5a6 6 0 0 1-.4 2.2M12 17.7v2.8M4 4l16 16" },
  cloudOff: { d: "M7 18.5a4.5 4.5 0 0 1-.9-8.9M9.4 6.4A6 6 0 0 1 18 10a4.2 4.2 0 0 1 2.2 7.6M4 4l16 16" },
  flame: { d: "M12 20.5c3.6 0 6-2.4 6-5.8 0-4.2-3.4-6-4.4-10.2-1.8 1.4-2.8 3.4-2.8 5.4-1-.6-1.6-1.6-1.8-2.8C7.4 8.6 6 10.8 6 14.7c0 3.4 2.4 5.8 6 5.8z" },
  bell: { d: "M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2H5zM10 20.5h4" },
  quote: { d: "M10 7.5c-3 .6-4.5 2.6-4.5 5.6v3.4h4v-4h-2.6M18.5 7.5c-3 .6-4.5 2.6-4.5 5.6v3.4h4v-4h-2.6" },
  spinner: { d: "M12 4a8 8 0 1 1-7.6 5.5" },
  phone2: { d: "M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5zM10.5 17.5h3" },
  cup: { d: "M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10.5h1.5a2.2 2.2 0 0 1 0 4.4H16M8 3.5v2.5M11 3.5v2.5" },
  rain: { d: "M7 15.5a4.5 4.5 0 0 1-.9-8.9A6 6 0 0 1 17.6 8a4 4 0 0 1-.6 7.5M8.5 18l-1 2M12.5 18l-1 2M16.5 18l-1 2" },
  faceSad: { d: "M8.8 15.6c1.8-1.6 4.6-1.6 6.4 0", c: [[12, 12, 8.5]], dot: [[9.2, 10], [14.8, 10]] },
  faceMeh: { d: "M9 15h6", c: [[12, 12, 8.5]], dot: [[9.2, 10], [14.8, 10]] },
  faceSmile: { d: "M8.6 13.6c1.8 2.2 5 2.2 6.8 0", c: [[12, 12, 8.5]], dot: [[9.2, 10], [14.8, 10]] },
  faceWink: { d: "M8.6 13.6c1.8 2.2 5 2.2 6.8 0M13.6 10h2.4", c: [[12, 12, 8.5]], dot: [[9.2, 10]] },
  firstAid: { d: "M5 7h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM9 7V5.5A1 1 0 0 1 10 4.5h4a1 1 0 0 1 1 1V7M12 10.5v6M9 13.5h6" },
};

export type IconName = keyof typeof GLYPHS;

/** Legacy Phosphor names → NEYU icons, so existing data keeps working and every icon comes from one family. */
const FROM_PH: Record<string, IconName> = {
  "ph-file-arrow-up": "upload", "ph-cloud-lightning": "rain", "ph-cloud-snow": "cloud", "ph-cloud-rain": "rain", "ph-cloud-fog": "cloud", "ph-coffee": "cup", "ph-wine": "cup",
  "ph-smiley-sad": "faceSad", "ph-smiley-meh": "faceMeh", "ph-smiley-wink": "faceWink", "ph-device-mobile": "phone2", "ph-android-logo": "phone2",
  "ph-cloud-slash": "cloudOff", "ph-microphone-slash": "micOff", "ph-arrow-up": "arrowUp", "ph-phone-call": "phone", "ph-globe-hemisphere-west": "globe", "ph-quotes": "quote", "ph-hand-pointing": "arrow",
  "ph-eye-slash": "eyeOff", "ph-wifi-high": "wifi", "ph-copy": "copy", "ph-plus-circle": "plus", "ph-circle-notch": "spinner", "ph-x-circle": "xCircle", "ph-circle": "circle", "ph-chart-line": "chart",
  "ph-caret-left": "chevronLeft", "ph-chat-circle": "chat", "ph-qr-code": "qr", "ph-seal-check": "shieldCheck", "ph-envelope-simple-open": "mail", "ph-download-simple": "download", "ph-bell-ringing": "bell",
  "ph-plugs": "sync", "ph-fire": "flame", "ph-caret-up": "chevronUp", "ph-envelope-open": "mail", "ph-link": "link", "ph-scan": "scan", "ph-identification-card": "idcard",
  "ph-export": "external", "ph-user-minus": "user", "ph-trash": "x", "ph-devices": "watch", "ph-arrow-square-in": "arrow", "ph-lock-open": "lock", "ph-envelope-simple": "mail", "ph-note-pencil": "doc",
  "ph-arrow-left": "arrowLeft", "ph-arrow-counter-clockwise": "loop", "ph-house-simple": "home", "ph-first-aid-kit": "firstAid", "ph-chats-circle": "chat", "ph-arrows-clockwise": "loop", "ph-magic-wand": "spark",
  "ph-chart-polar": "target", "ph-calendar-dots": "calendar", "ph-smiley": "faceSmile", "ph-smiley-blank": "faceMeh", "ph-timer": "clock", "ph-hourglass": "hourglass", "ph-sort-descending": "bars", "ph-cpu": "monitor",
  "ph-clock-counter-clockwise": "clock", "ph-calendar-blank": "calendar", "ph-arrows-split": "route", "ph-lock-simple": "lock", "ph-gear-six": "loop", "ph-printer": "doc", "ph-stairs": "steps",
  "Award": "award", "Globe2": "globe", "Waves": "wind", "Scan": "scan", "Footprints": "steps", "ClipboardList": "doc", "Dna": "dna", "BrainCircuit": "brain", "FileText": "doc", "Phone": "phone", "MapPin": "pin",
  "BookOpen": "book", "HeartCrack": "heartPulse", "Users": "users", "Baby": "child", "Salad": "apple", "Brain": "brain", "Droplet": "drop", "Droplets": "drop", "Bone": "joint", "Microscope": "microscope", "Pill": "pill",
  "Activity": "pulse", "Stethoscope": "stethoscope", "Radio": "monitor", "Wind": "lungs", "HeartPulse": "heartPulse", "Heart": "heart", "Gauge": "gauge", "FlaskConical": "flask",
  "ph-moon-stars": "moon", "ph-scissors": "skin", "ph-gender-female": "hormone", "ph-flower-lotus": "leaf", "ph-drop-half": "thyroid", "ph-circles-four": "microbiome", "ph-carrot": "apple",
  "ph-waves": "wind", "ph-target": "target", "ph-sun-horizon": "sun", "ph-sun": "sun", "ph-heart-break": "heartPulse", "ph-headset": "chat", "ph-footprints": "steps", "ph-flower-tulip": "leaf",
  "ph-flower": "leaf", "ph-drop-half-bottom": "drop", "ph-dots-nine": "layers", "ph-bed": "moon", "ph-barbell": "dumbbell", "ph-mask-happy": "skin", "ph-hourglass-medium": "hourglass", "ph-person-simple": "user",
  "ph-heart": "heart", "ph-heartbeat": "heartPulse", "ph-pulse": "pulse", "ph-wave-sine": "pulse", "ph-waveform": "pulse", "ph-stethoscope": "stethoscope", "ph-wind": "lungs",
  "ph-brain": "brain", "ph-dna": "dna", "ph-flask": "flask", "ph-test-tube": "tube", "ph-drop": "drop", "ph-lightning": "bolt", "ph-moon": "moon", "ph-plant": "leaf", "ph-leaf": "leaf",
  "ph-baby": "child", "ph-bowl-food": "food", "ph-apple-logo": "apple", "ph-pill": "pill", "ph-atom": "hormone", "ph-hexagon": "tierTwo", "ph-circle-half": "tierOne", "ph-crown-simple": "tierThree",
  "ph-user": "user", "ph-users-three": "users", "ph-users": "users", "ph-user-plus": "user", "ph-user-focus": "user", "ph-identification-badge": "idcard", "ph-hand-heart": "care", "ph-hand": "care",
  "ph-video-camera": "video", "ph-chat-circle-dots": "chat", "ph-microphone": "mic", "ph-clipboard-text": "doc", "ph-file-text": "doc", "ph-folder-simple-user": "folder", "ph-books": "book", "ph-book-open-text": "book",
  "ph-chart-line-up": "chart", "ph-trend-up": "trend", "ph-trend-down": "trend", "ph-graph": "network", "ph-git-branch": "network", "ph-circles-three": "network", "ph-sparkle": "spark", "ph-magnifying-glass": "search",
  "ph-compass": "compass", "ph-fingerprint": "fingerprint", "ph-lock-key": "lock", "ph-shield-check": "shieldCheck", "ph-check": "check", "ph-check-circle": "check", "ph-info": "info", "ph-siren": "alert", "ph-first-aid": "firstAid",
  "ph-package": "package", "ph-cube": "package", "ph-briefcase": "briefcase", "ph-house-line": "homeDrop", "ph-buildings": "clinic", "ph-path": "route", "ph-calendar-plus": "calendar", "ph-calendar-check": "calendarCheck",
  "ph-gauge": "gauge", "ph-watch": "watch", "ph-person-simple-run": "steps", "ph-person-simple-walk": "steps", "ph-scales": "scale", "ph-cigarette-slash": "noSmoke", "ph-cloud-sun": "cloud", "ph-plug": "sync",
  "ph-paper-plane-tilt": "referral", "ph-list-checks": "doc", "ph-squares-four": "layers", "ph-arrows-down-up": "loop", "ph-prohibit": "alert", "ph-arrow-right": "arrow", "ph-arrow-up-right": "external", "ph-arrow-down": "arrowDown", "ph-x": "x", "ph-caret-right": "chevron", "ph-caret-down": "chevronDown", "ph-minus": "minus", "ph-plus": "plus",
  "ph-arrow-square-out": "external", "ph-play": "play", "ph-pause": "pause", "ph-speaker-high": "sound", "ph-speaker-slash": "mute", "ph-star": "star", "ph-medal": "award", "ph-certificate": "award", "ph-trophy": "award",
  "ph-map-pin": "pin", "ph-phone": "phone", "ph-envelope": "mail", "ph-clock": "clock", "ph-calendar": "calendar", "ph-car": "car", "ph-globe": "globe", "ph-translate": "language", "ph-map-trifold": "map", "ph-navigation-arrow": "route",
  "ph-camera": "camera", "ph-upload-simple": "upload", "ph-paperclip": "upload", "ph-warning": "alert", "ph-warning-circle": "alert", "ph-heart-straight": "heart", "ph-activity": "pulse", "ph-thermometer": "gauge",
  "ph-graduation-cap": "cap", "ph-student": "cap", "ph-flag": "flag", "ph-eye": "eye", "ph-lock": "lock", "ph-house": "home", "ph-hospital": "clinic", "ph-microscope": "microscope", "ph-syringe": "tube", "ph-eyedropper": "drop",
  "ph-person": "user", "ph-user-circle": "user", "ph-chat-centered-text": "chat", "ph-chats": "chat", "ph-list": "layers", "ph-gear": "loop", "ph-bell": "alert", "ph-question": "info",
};
export const iconName = (n: string): IconName => (n in GLYPHS ? (n as IconName) : FROM_PH[n] || "spark");

/**
 * One NEYU icon. `tone`: "ink" (navy), "grad" (green→blue gradient stroke), "light" (white), or any CSS colour.
 */
export function NIcon({ name, size = 22, tone = "ink", stroke = 1.5, style, title }: { name: string; size?: number | string; tone?: "ink" | "grad" | "light" | string; stroke?: number; style?: React.CSSProperties; title?: string }) {
  const id = useId().replace(/:/g, "");
  const g = GLYPHS[iconName(name)];
  const col = tone === "ink" ? "#14324A" : tone === "light" ? "#FFFFFF" : tone === "grad" ? `url(#${id}g)` : tone;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false" style={{ display: "block", flex: "none", ...style }}>
      {tone === "grad" && <defs><linearGradient id={`${id}g`} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2FBF94" /><stop offset=".55" stopColor="#1FA7B4" /><stop offset="1" stopColor="#2273D6" /></linearGradient></defs>}
      <Glyph g={g} col={col} />
    </svg>
  );
}

/** The raw strokes of a glyph — for drawing inside another SVG (e.g. node networks). */
export function Glyph({ g, col }: { g: Glyph; col: string }) {
  return (
    <>
      {g.d && <path d={g.d} />}
      {g.c?.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      {g.dot?.map(([cx, cy], i) => <circle key={"d" + i} cx={cx} cy={cy} r={1.05} fill={col} stroke="none" />)}
    </>
  );
}

/** Draw a NEYU icon inside an existing SVG, centred at (x, y), `size` units wide. */
export function SvgIcon({ name, x, y, size, color, stroke = 1.5 }: { name: string; x: number; y: number; size: number; color: string; stroke?: number }) {
  const g = GLYPHS[iconName(name)];
  const s = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
      <Glyph g={g} col={color} />
    </g>
  );
}
