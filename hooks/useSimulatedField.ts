"use client";

import { useEffect, useState } from "react";
import { history, liveValue, type Point, SENSORS, type SensorKey } from "@/lib/field";

export type FieldState = {
  ready: boolean;
  history: Record<SensorKey, Point[]>;
  live: Record<SensorKey, number>;
  updatedAt: number;
};

const empty = () => ({ temperature: [], humidity: [], soil: [], light: [] }) as Record<SensorKey, Point[]>;

/** Simulated sensor feed: 24h of hourly history plus a live value that updates every few seconds. */
export function useSimulatedField(tickMs = 3000): FieldState {
  const [state, setState] = useState<FieldState>({
    ready: false,
    history: empty(),
    live: { temperature: 0, humidity: 0, soil: 0, light: 0 },
    updatedAt: 0,
  });

  useEffect(() => {
    const now = new Date();
    const h = empty();
    const live = {} as Record<SensorKey, number>;
    for (const s of SENSORS) {
      h[s.key] = history(s, now);
      live[s.key] = liveValue(s, now, h[s.key][h[s.key].length - 1].v);
    }
    setState({ ready: true, history: h, live, updatedAt: now.getTime() });

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setState(prev => {
        const t = new Date();
        const next = { ...prev.live };
        for (const s of SENSORS) next[s.key] = liveValue(s, t, prev.live[s.key]);
        return { ...prev, live: next, updatedAt: t.getTime() };
      });
    }, reduce ? tickMs * 3 : tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return state;
}
