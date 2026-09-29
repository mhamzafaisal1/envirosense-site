import { API_URL } from "@/lib/config";

export const FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"] as const;
export type Feature = (typeof FEATURES)[number];
export type Reading = Record<Feature, number>;

export type Check = { feature: Feature; label: string; value: number; low: number; high: number; unit: string; status: "low" | "ok" | "high" };
export type Prediction = {
  recommended_crop: string;
  confidence: number;
  top_crops: { crop: string; probability: number }[];
  baseline: { model: string; crop: string; probability: number };
  assessment: { crop: string; condition: "Healthy" | "Needs attention" | "Poor fit"; out_of_range: number; checks: Check[]; actions: string[]; method: string };
  model_version: string;
};

export async function predict(reading: Reading, targetCrop?: string, signal?: AbortSignal): Promise<Prediction> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...reading, ...(targetCrop ? { target_crop: targetCrop } : {}) }),
    signal,
  });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function ping(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal, cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
