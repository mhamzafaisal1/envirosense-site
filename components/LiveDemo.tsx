"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Code2, Loader2, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import StatusDot from "@/components/StatusDot";
import { useApiStatus } from "@/hooks/useApiStatus";
import { cap, type Feature, type Prediction, predict, type Reading } from "@/lib/api";
import { API_URL } from "@/lib/config";

const SLIDERS: { key: Feature; label: string; unit: string; min: number; max: number; step: number }[] = [
  { key: "N", label: "Nitrogen", unit: "kg/ha", min: 0, max: 140, step: 1 },
  { key: "P", label: "Phosphorus", unit: "kg/ha", min: 5, max: 145, step: 1 },
  { key: "K", label: "Potassium", unit: "kg/ha", min: 5, max: 205, step: 1 },
  { key: "temperature", label: "Temperature", unit: "°C", min: 8, max: 44, step: 0.1 },
  { key: "humidity", label: "Humidity", unit: "%", min: 14, max: 100, step: 0.5 },
  { key: "ph", label: "Soil pH", unit: "", min: 3.5, max: 9.9, step: 0.05 },
  { key: "rainfall", label: "Rainfall", unit: "mm", min: 20, max: 300, step: 1 },
];

// Medians of each crop's real samples in the dataset.
const PRESETS: { name: string; reading: Reading }[] = [
  { name: "Paddy field", reading: { N: 80, P: 47, K: 40, temperature: 23.7, humidity: 82, ph: 6.4, rainfall: 233 } },
  { name: "Maize plot", reading: { N: 76, P: 48, K: 20, temperature: 22.8, humidity: 65, ph: 6.3, rainfall: 83 } },
  { name: "Dry upland", reading: { N: 39, P: 68, K: 79, temperature: 18.9, humidity: 17, ph: 7.4, rainfall: 80 } },
  { name: "Hill estate", reading: { N: 103, P: 29, K: 30, temperature: 25.7, humidity: 58, ph: 6.8, rainfall: 158 } },
  { name: "Humid lowland", reading: { N: 100, P: 81, K: 50, temperature: 27.4, humidity: 80, ph: 6.0, rainfall: 105 } },
];

const CONDITION_COLOR = { Healthy: "text-accent", "Needs attention": "text-amber", "Poor fit": "text-red-400" } as const;

function RangeBar({ value, low, high, min, max, status }: { value: number; low: number; high: number; min: number; max: number; status: string }) {
  const pct = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
  return (
    <div className="relative h-2 rounded-full bg-bg">
      <div className="absolute inset-y-0 rounded-full bg-accent/25" style={{ left: pct(low), width: `calc(${pct(high)} - ${pct(low)})` }} />
      <div className={`absolute top-1/2 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm ${status === "ok" ? "bg-accent" : "bg-amber"}`} style={{ left: pct(value) }} />
    </div>
  );
}

export default function LiveDemo() {
  const status = useApiStatus();
  const [reading, setReading] = useState<Reading>(PRESETS[0].reading);
  const [preset, setPreset] = useState(PRESETS[0].name);
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  const run = useCallback(async (r: Reading, t: string) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    try {
      const res = await predict(r, t || undefined, c.signal);
      setResult(res);
      setLatency(Math.round(performance.now() - t0));
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Couldn't reach the model. It may be waking up. Try again in a few seconds.");
    } finally {
      if (ctrl.current === c) setLoading(false);
    }
  }, []);

  // First prediction once the API answers the health check.
  useEffect(() => {
    if (status === "online" && !result) run(reading, target);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-predict shortly after the user stops dragging.
  useEffect(() => {
    if (status !== "online" || !result) return;
    const id = window.setTimeout(() => run(reading, target), 250);
    return () => window.clearTimeout(id);
  }, [reading, target]); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = (key: Feature, v: number) => {
    setPreset("Custom");
    setReading(r => ({ ...r, [key]: v }));
  };

  const curl = `curl -X POST ${API_URL}/predict \\\n  -H 'content-type: application/json' \\\n  -d '${JSON.stringify({ ...reading, ...(target ? { target_crop: target } : {}) })}'`;

  return (
    <section id="demo" className="section-shell bg-[#08100d]">
      <div className="section-inner">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="section-label">Live demo</p>
            <h2 className="section-title mt-4">Enter a soil test. Get a recommendation.</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-textMuted">
              Every result below comes from the deployed Random Forest model, not a mock. Pick a preset or drag the sliders.
            </p>
          </div>
          <StatusDot status={status} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Inputs */}
          <div className="card p-6">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => { setPreset(p.name); setReading(p.reading); }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${preset === p.name ? "border-accent bg-accent/15 text-accent" : "border-border text-textMuted hover:border-accent/50"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-5">
              {SLIDERS.map(s => (
                <label key={s.key} className="block">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-textMuted">{s.label}</span>
                    <span className="font-mono text-textPrimary">{reading[s.key]}{s.unit && <span className="text-textMuted"> {s.unit}</span>}</span>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={reading[s.key]}
                    onChange={e => setValue(s.key, Number(e.target.value))}
                    className="w-full accent-[#4ade80]"
                    aria-label={s.label}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5 text-sm">
              <span className="text-textMuted">Assess for crop</span>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-textPrimary"
              >
                <option value="">Top recommendation</option>
                {["apple","banana","blackgram","chickpea","coconut","coffee","cotton","grapes","jute","kidneybeans","lentil","maize","mango","mothbeans","mungbean","muskmelon","orange","papaya","pigeonpeas","pomegranate","rice","watermelon"].map(c => (
                  <option key={c} value={c}>{cap(c)}</option>
                ))}
              </select>
            </div>
            {status !== "online" && !result && (
              <button
                onClick={() => run(reading, target)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-bg"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />} Run prediction
              </button>
            )}
          </div>

          {/* Output */}
          <div className="card relative min-h-[520px] p-6">
            {loading && <Loader2 className="absolute right-5 top-5 animate-spin text-accent" size={18} />}
            {error && <p className="rounded-lg border border-amber/30 bg-amber/10 p-4 text-sm text-amber">{error}</p>}
            {!result && !error && (
              <div className="grid h-full min-h-[460px] place-items-center text-center text-textMuted">
                <div>
                  <Loader2 className="mx-auto mb-4 animate-spin text-accent" />
                  <p>{status === "waking" ? "The model host is waking up. The first request can take ~30 seconds." : "Loading model…"}</p>
                </div>
              </div>
            )}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: loading ? 0.6 : 1 }}>
                  <p className="font-mono text-xs uppercase tracking-widest text-textMuted">Recommended crop</p>
                  <div className="mt-2 flex items-baseline justify-between gap-4">
                    <p className="text-5xl font-bold text-accent">{cap(result.recommended_crop)}</p>
                    <p className="font-mono text-sm text-textMuted">{(result.confidence * 100).toFixed(0)}% of trees agree</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {result.top_crops.map(c => (
                      <div key={c.crop}>
                        <div className="mb-1 flex justify-between text-sm"><span>{cap(c.crop)}</span><span className="font-mono text-textMuted">{(c.probability * 100).toFixed(1)}%</span></div>
                        <div className="h-2 rounded-full bg-bg"><motion.div className="h-full rounded-full bg-accent" animate={{ width: `${c.probability * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-textMuted">
                    Baseline (logistic regression): <span className="text-amber">{cap(result.baseline.crop)}</span> at {(result.baseline.probability * 100).toFixed(0)}%
                    {result.baseline.crop === result.recommended_crop ? ": the two models agree." : ": the two models disagree on this input."}
                  </p>

                  <div className="my-6 h-px bg-border" />
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">Field check for {cap(result.assessment.crop)}</p>
                    <p className={`font-mono text-sm ${CONDITION_COLOR[result.assessment.condition]}`}>{result.assessment.condition}</p>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {result.assessment.checks.map(c => {
                      const s = SLIDERS.find(x => x.key === c.feature)!;
                      return (
                        <div key={c.feature} className="grid grid-cols-[92px_1fr_64px] items-center gap-3 text-xs">
                          <span className="text-textMuted">{c.label}</span>
                          <RangeBar value={c.value} low={c.low} high={c.high} min={s.min} max={s.max} status={c.status} />
                          <span className={`text-right font-mono ${c.status === "ok" ? "text-textMuted" : "text-amber"}`}>{c.status === "ok" ? "in range" : c.status}</span>
                        </div>
                      );
                    })}
                  </div>
                  <ul className="mt-5 space-y-1.5 text-sm text-textPrimary">
                    {result.assessment.actions.map(a => <li key={a}>→ {a}</li>)}
                  </ul>
                  <p className="mt-3 text-xs text-textMuted">Shaded band: 10th–90th percentile of real samples for this crop.</p>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 font-mono text-xs text-textMuted">
                    <span>{latency !== null && `${latency} ms round trip · `}{result.model_version}</span>
                    <button onClick={() => setShowJson(v => !v)} className="flex items-center gap-1.5 hover:text-accent"><Code2 size={14} /> {showJson ? "Hide" : "Show"} API call</button>
                  </div>
                  {showJson && (
                    <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-bg p-4 text-[11px] leading-5 text-textMuted">{curl}{"\n\n"}{JSON.stringify(result, null, 2)}</pre>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
