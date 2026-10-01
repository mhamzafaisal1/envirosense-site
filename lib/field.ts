// Demo field for the in-site app. Every sensor value here is simulated in the browser;
// only the AI check (POST /predict) talks to the real model.

export type SensorKey = "temperature" | "humidity" | "soil" | "light";

export type SensorDef = {
  key: SensorKey;
  label: string;
  unit: string;
  decimals: number;
  range?: [number, number]; // healthy band for the demo crop (paddy rice)
  base: number; // daily mean
  swing: number; // half the day/night amplitude
  peakHour: number; // hour of the daily maximum
  drift: number; // trend across the last 24h, total change
  noise: number;
};

export const SENSORS: SensorDef[] = [
  { key: "temperature", label: "Temperature", unit: "°C", decimals: 1, range: [20, 30], base: 24, swing: 3.4, peakHour: 15, drift: 0.6, noise: 0.25 },
  { key: "humidity", label: "Humidity", unit: "%", decimals: 0, range: [70, 90], base: 79, swing: 6, peakHour: 5, drift: -7, noise: 0.8 },
  { key: "soil", label: "Soil moisture", unit: "%", decimals: 0, range: [35, 60], base: 47, swing: 1.5, peakHour: 7, drift: -5, noise: 0.5 },
  { key: "light", label: "Light", unit: " lx", decimals: 0, base: 0, swing: 0, peakHour: 13, drift: 0, noise: 25 },
];

// Lab soil test for the demo field: values the model needs but no sensor measures.
export const SOIL_TEST = { N: 80, P: 47, K: 40, ph: 6.4, date: "Sep 12" };
export const SEASON_RAINFALL = 232; // mm, season to date

export type Point = { t: number; v: number }; // t = epoch ms

// Deterministic pseudo-random so the server and client render the same history.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296 - 0.5;
  };
}

function valueAt(def: SensorDef, date: Date, progress: number, r: () => number) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (def.key === "light") {
    const day = Math.sin(((h - 6) / 13) * Math.PI); // sunrise 6:00, sunset 19:00
    return Math.max(0, day) * 880 + (day > 0 ? r() * def.noise * 2 : 0);
  }
  const cycle = Math.cos(((h - def.peakHour) / 24) * 2 * Math.PI) * def.swing;
  return def.base + cycle + (progress - 0.5) * def.drift + r() * def.noise * 2;
}

/** 24 hourly readings ending at the most recent full hour. */
export function history(def: SensorDef, now: Date): Point[] {
  const r = rng(def.key.length * 7919 + 17);
  const end = new Date(now);
  end.setMinutes(0, 0, 0);
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(end.getTime() - (23 - i) * 3600_000);
    return { t: d.getTime(), v: valueAt(def, d, i / 23, r) };
  });
}

/** A fresh live reading near the end of the trend. */
export function liveValue(def: SensorDef, now: Date, last: number) {
  const target = valueAt(def, now, 1, Math.random.bind(Math) as () => number);
  const v = last + (target - last) * 0.35 + (Math.random() - 0.5) * def.noise;
  return def.key === "light" ? Math.max(0, v) : v;
}

export type Status = "ok" | "low" | "high" | "none";
export function statusOf(def: SensorDef, v: number): Status {
  if (!def.range) return "none";
  return v < def.range[0] ? "low" : v > def.range[1] ? "high" : "ok";
}

export const fmt = (def: SensorDef, v: number) => v.toFixed(def.decimals);
