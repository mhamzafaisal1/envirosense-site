"use client";

import { useEffect, useState } from "react";
import { ping } from "@/lib/api";

export type ApiStatus = "checking" | "waking" | "online" | "offline";

// One shared health check per page load, however many components ask.
let shared: Promise<boolean> | null = null;
function healthOnce() {
  if (!shared) {
    const ctrl = new AbortController();
    window.setTimeout(() => ctrl.abort(), 75000);
    shared = ping(ctrl.signal);
  }
  return shared;
}

/** Free-tier hosts sleep, so a slow first reply shows as "waking". */
export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("checking");
  useEffect(() => {
    let live = true;
    const slow = window.setTimeout(() => live && setStatus(s => (s === "checking" ? "waking" : s)), 2500);
    healthOnce().then(ok => live && setStatus(ok ? "online" : "offline"));
    return () => {
      live = false;
      window.clearTimeout(slow);
    };
  }, []);
  return status;
}
