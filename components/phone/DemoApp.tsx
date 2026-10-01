"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, BrainCircuit, ChevronRight, Droplets, ExternalLink, FlaskConical, House, Info, Leaf, Loader2, Sun, Thermometer, Waves } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DayChart, Trend } from "@/components/phone/charts";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useSimulatedField, type FieldState } from "@/hooks/useSimulatedField";
import { cap, type Prediction, predict, type Reading } from "@/lib/api";
import { API_URL, GITHUB, PAPER_PDF } from "@/lib/config";
import { fmt, SEASON_RAINFALL, SENSORS, type SensorDef, type SensorKey, SOIL_TEST, statusOf } from "@/lib/field";

type Tab = "home" | "sensors" | "ai" | "about";

const ICON: Record<SensorKey, typeof Thermometer> = { temperature: Thermometer, humidity: Droplets, soil: Waves, light: Sun };
const STATUS_TEXT = { ok: "In range", low: "Below range", high: "Above range", none: "Daylight" } as const;
const STATUS_TONE = { ok: "text-accent", low: "text-amber", high: "text-amber", none: "text-textMuted" } as const;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(300);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const sensor = (k: SensorKey) => SENSORS.find(s => s.key === k)!;

function summary(f: FieldState) {
  const out = SENSORS.filter(s => statusOf(s, f.live[s.key]) === "low" || statusOf(s, f.live[s.key]) === "high");
  const hum = f.history.humidity;
  const humDrop = hum.length ? hum[0].v - f.live.humidity : 0;
  if (out.length) {
    const s = out[0];
    return { state: "Needs attention", text: `${s.label} is ${statusOf(s, f.live[s.key]) === "low" ? "below" : "above"} its ${s.range![0]}–${s.range![1]}${s.unit} band at ${fmt(s, f.live[s.key])}${s.unit}.` };
  }
  if (humDrop > 4) return { state: "Healthy", text: `All sensors are in range. Humidity has fallen ${humDrop.toFixed(0)}% since yesterday, so keep an eye on it tonight.` };
  return { state: "Healthy", text: "All sensors are in range for paddy rice." };
}

/* ───────────────────────────── Screens ───────────────────────────── */

function Home({ f, go, last }: { f: FieldState; go: (t: Tab, s?: SensorKey) => void; last: Prediction | null }) {
  const s = summary(f);
  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      <header>
        <h3 className="text-[22px] font-semibold leading-tight text-textPrimary">North Plot</h3>
        <p className="mt-0.5 text-[13px] text-textMuted">Demo farm · 2.4 ha · Paddy rice</p>
      </header>

      <section className="rounded-2xl bg-[#13241a] p-4">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${s.state === "Healthy" ? "bg-accent" : "bg-amber"}`} />
          <p className={`text-[13px] font-semibold ${s.state === "Healthy" ? "text-accent" : "text-amber"}`}>{s.state}</p>
        </div>
        <p className="mt-2 text-[15px] leading-snug text-textPrimary">{s.text}</p>
      </section>

      <section aria-label="Sensors" className="grid grid-cols-2 gap-2.5">
        {SENSORS.map(def => {
          const Icon = ICON[def.key];
          const st = statusOf(def, f.live[def.key]);
          return (
            <button
              key={def.key}
              onClick={() => go("sensors", def.key)}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition hover:border-accent/40 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <div className="flex items-center gap-1.5 text-[12px] text-textMuted">
                <Icon size={13} strokeWidth={2} /> {def.label}
              </div>
              <p className="mt-1.5 font-mono text-[22px] leading-none text-textPrimary" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(def, f.live[def.key])}
                <span className="ml-0.5 text-[13px] text-textMuted">{def.unit.trim()}</span>
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className={`text-[11px] ${STATUS_TONE[st]}`}>{STATUS_TEXT[st]}</span>
                <Trend points={f.history[def.key].slice(-12)} width={58} height={20} tone={st === "low" || st === "high" ? "#f59e0b" : "#4ade80"} />
              </div>
            </button>
          );
        })}
      </section>

      <button onClick={() => go("ai")} className="flex w-full items-center gap-3 rounded-2xl bg-accent px-4 py-3.5 text-left text-bg transition hover:brightness-110">
        <BrainCircuit size={22} />
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">{last ? `Best fit: ${cap(last.recommended_crop)}` : "Run AI check"}</span>
          <span className="block text-[12px] opacity-75">{last ? `${Math.round(last.confidence * 100)}% of trees agree · tap to re-run` : "Best crop for these conditions"}</span>
        </span>
        <ChevronRight size={18} />
      </button>

      <section className="rounded-2xl border border-white/[0.06] px-4 py-3">
        <p className="flex items-center gap-2 text-[12px] text-textMuted">
          <FlaskConical size={14} /> Lab soil test · {SOIL_TEST.date}
        </p>
        <dl className="mt-2 grid grid-cols-4 gap-2">
          {([["N", SOIL_TEST.N], ["P", SOIL_TEST.P], ["K", SOIL_TEST.K], ["pH", SOIL_TEST.ph]] as const).map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] text-textMuted">{k}</dt>
              <dd className="font-mono text-[15px] text-textPrimary" style={{ fontVariantNumeric: "tabular-nums" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function Sensors({ f, selected, setSelected }: { f: FieldState; selected: SensorKey; setSelected: (k: SensorKey) => void }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const def = sensor(selected);
  const pts = [...f.history[selected], { t: f.updatedAt, v: f.live[selected] }];
  const vals = pts.map(p => p.v);
  const st = statusOf(def, f.live[selected]);
  return (
    <div className="space-y-4 px-4 pb-6 pt-2" ref={ref}>
      <h3 className="text-[22px] font-semibold text-textPrimary">Sensors</h3>
      <div role="tablist" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SENSORS.map(s => (
          <button
            key={s.key}
            role="tab"
            aria-selected={s.key === selected}
            onClick={() => setSelected(s.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] transition ${s.key === selected ? "bg-accent text-bg" : "bg-white/[0.05] text-textMuted hover:text-textPrimary"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div>
        <p className="font-mono text-[40px] leading-none text-textPrimary" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(def, f.live[selected])}
          <span className="ml-1 text-[18px] text-textMuted">{def.unit.trim()}</span>
        </p>
        <p className={`mt-2 text-[13px] ${STATUS_TONE[st]}`}>
          {STATUS_TEXT[st]}
          {def.range && <span className="text-textMuted"> · healthy {def.range[0]}–{def.range[1]}{def.unit}</span>}
        </p>
      </div>

      <div className="-mx-1">
        <DayChart points={pts} range={def.range} width={Math.max(220, w - 24)} height={170} />
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[["Low", Math.min(...vals)], ["Average", vals.reduce((a, b) => a + b, 0) / vals.length], ["High", Math.max(...vals)]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl bg-white/[0.03] py-2.5">
            <dt className="text-[11px] text-textMuted">{l}</dt>
            <dd className="mt-0.5 font-mono text-[15px] text-textPrimary" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(def, v as number)}{def.unit.trim() === "lx" ? "" : def.unit.trim()}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] leading-relaxed text-textMuted">Hourly readings over the last 24 hours, plus the live value. Simulated feed.</p>
    </div>
  );
}

type Scenario = { name: string; temperature?: number; humidity?: number; rainfall: number; N: number; P: number; K: number; ph: number };
const SCENARIOS: Scenario[] = [
  { name: "This field", rainfall: SEASON_RAINFALL, N: SOIL_TEST.N, P: SOIL_TEST.P, K: SOIL_TEST.K, ph: SOIL_TEST.ph },
  { name: "Dry spell", temperature: 28, humidity: 52, rainfall: 62, N: 22, P: 60, K: 20, ph: 6.9 },
  { name: "Hill orchard", temperature: 19, humidity: 88, rainfall: 110, N: 25, P: 130, K: 200, ph: 5.9 },
];

const INPUTS: { key: keyof Reading; label: string; unit: string; step: number; source: (s: number) => string }[] = [
  { key: "temperature", label: "Temperature", unit: "°C", step: 0.5, source: s => (s === 0 ? "Live sensor" : "Scenario") },
  { key: "humidity", label: "Humidity", unit: "%", step: 1, source: s => (s === 0 ? "Live sensor" : "Scenario") },
  { key: "rainfall", label: "Rainfall", unit: "mm", step: 5, source: () => "Season total" },
  { key: "N", label: "Nitrogen", unit: "kg/ha", step: 2, source: () => "Soil test" },
  { key: "P", label: "Phosphorus", unit: "kg/ha", step: 2, source: () => "Soil test" },
  { key: "K", label: "Potassium", unit: "kg/ha", step: 2, source: () => "Soil test" },
  { key: "ph", label: "Soil pH", unit: "", step: 0.1, source: () => "Soil test" },
];

type AIStore = {
  scenario: number; setScenario: (n: number) => void;
  values: Reading | null; setValues: React.Dispatch<React.SetStateAction<Reading | null>>;
  result: Prediction | null; setResult: (p: Prediction | null) => void;
  ms: number | null; setMs: (n: number | null) => void;
};

function useAIStore(): AIStore {
  const [scenario, setScenario] = useState(0);
  const [values, setValues] = useState<Reading | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  return { scenario, setScenario, values, setValues, result, setResult, ms, setMs };
}

function AICheck({ f, store }: { f: FieldState; store: AIStore }) {
  const status = useApiStatus();
  const { scenario, setScenario, values, setValues, result, setResult, ms, setMs } = store;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromScenario = useCallback(
    (i: number): Reading => {
      const s = SCENARIOS[i];
      return {
        temperature: +(s.temperature ?? f.live.temperature).toFixed(1),
        humidity: Math.round(s.humidity ?? f.live.humidity),
        rainfall: s.rainfall, N: s.N, P: s.P, K: s.K, ph: s.ph,
      };
    },
    [f.live.temperature, f.live.humidity],
  );

  useEffect(() => {
    if (f.ready && !values) setValues(fromScenario(0));
  }, [f.ready, values, fromScenario, setValues]);

  const pick = (i: number) => { setScenario(i); setValues(fromScenario(i)); setResult(null); };
  const bump = (k: keyof Reading, d: number) =>
    setValues(v => (v ? { ...v, [k]: +Math.max(0, v[k] + d).toFixed(k === "ph" ? 1 : k === "temperature" ? 1 : 0) } : v));

  const run = async () => {
    if (!values) return;
    setLoading(true); setError(null);
    const t0 = performance.now();
    try {
      setResult(await predict(values));
      setMs(Math.round(performance.now() - t0));
    } catch {
      setError("The model didn't answer. It may still be waking up; try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-2">
      <header>
        <h3 className="text-[22px] font-semibold text-textPrimary">AI check</h3>
        <p className="mt-1 text-[13px] leading-snug text-textMuted">Sends these conditions to the deployed Random Forest and returns the best-fit crop.</p>
      </header>

      <div className="flex gap-1.5">
        {SCENARIOS.map((s, i) => (
          <button key={s.name} onClick={() => pick(i)} className={`rounded-full px-3 py-1.5 text-[12px] transition ${i === scenario ? "bg-white/[0.12] text-textPrimary" : "bg-white/[0.04] text-textMuted hover:text-textPrimary"}`}>
            {s.name}
          </button>
        ))}
      </div>

      {values && (
        <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06]">
          {INPUTS.map(inp => (
            <li key={inp.key} className="flex items-center gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-textPrimary">{inp.label}</p>
                <p className="text-[10.5px] text-textMuted">{inp.source(scenario)}</p>
              </div>
              <button aria-label={`Decrease ${inp.label}`} onClick={() => bump(inp.key, -inp.step)} className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.05] text-textMuted hover:text-textPrimary">−</button>
              <span className="w-[62px] text-right font-mono text-[13px] text-textPrimary" style={{ fontVariantNumeric: "tabular-nums" }}>
                {values[inp.key]}<span className="text-[10px] text-textMuted">{inp.unit ? ` ${inp.unit}` : ""}</span>
              </span>
              <button aria-label={`Increase ${inp.label}`} onClick={() => bump(inp.key, inp.step)} className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.05] text-textMuted hover:text-textPrimary">+</button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={run} disabled={loading || !values} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[15px] font-semibold text-bg transition hover:brightness-110 disabled:opacity-60">
        {loading ? <><Loader2 size={18} className="animate-spin" /> {status === "online" ? "Asking the model…" : "Waking the model…"}</> : <><BrainCircuit size={18} /> Run AI check</>}
      </button>
      {loading && status !== "online" && <p className="text-center text-[11px] text-textMuted">Free-tier server: the first request can take up to 30 s.</p>}
      {error && <p className="rounded-xl bg-amber/10 p-3 text-[12px] text-amber">{error}</p>}

      <AnimatePresence>
        {result && !loading && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="rounded-2xl bg-[#13241a] p-4">
            <p className="text-[12px] text-textMuted">Best fit</p>
            <div className="flex items-baseline justify-between">
              <p className="text-[30px] font-semibold leading-tight text-accent">{cap(result.recommended_crop)}</p>
              <p className="font-mono text-[12px] text-textMuted">{Math.round(result.confidence * 100)}% of trees</p>
            </div>
            <div className="mt-3 space-y-2">
              {result.top_crops.map(c => (
                <div key={c.crop}>
                  <div className="flex justify-between text-[12px]"><span className="text-textPrimary">{cap(c.crop)}</span><span className="font-mono text-textMuted">{(c.probability * 100).toFixed(0)}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-accent" style={{ width: `${c.probability * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3 text-[12.5px] leading-snug text-textPrimary">
              {result.assessment.actions.slice(0, 3).map(a => <li key={a} className="flex gap-2"><Leaf size={13} className="mt-0.5 shrink-0 text-accent" />{a}</li>)}
            </ul>
            <p className="mt-3 font-mono text-[10.5px] text-textMuted">
              {ms !== null && `${ms} ms · `}baseline agrees: {result.baseline.crop === result.recommended_crop ? "yes" : `no (${cap(result.baseline.crop)})`}
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function About() {
  const rows: [string, string, boolean][] = [
    ["Crop recommendation", "Random Forest served from a FastAPI service on Render", true],
    ["Field check", "Your inputs compared to each crop's observed ranges", true],
    ["Sensor readings", "Simulated in your browser for this demo", false],
    ["Soil test", "Fixed demo values (N, P, K, pH)", false],
  ];
  const links: [string, string][] = [
    ["API docs", `${API_URL}/docs`],
    ["Mobile app source (React Native)", GITHUB.app],
    ["Model & training code", GITHUB.ml],
    ["Research paper (PDF)", PAPER_PDF],
  ];
  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      <h3 className="text-[22px] font-semibold text-textPrimary">What's real here</h3>
      <ul className="space-y-3">
        {rows.map(([t, d, real]) => (
          <li key={t} className="flex gap-3">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${real ? "bg-accent" : "bg-textMuted/50"}`} />
            <div>
              <p className="text-[14px] text-textPrimary">{t} <span className={`text-[11px] ${real ? "text-accent" : "text-textMuted"}`}>{real ? "· live" : "· simulated"}</span></p>
              <p className="text-[12px] leading-snug text-textMuted">{d}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06]">
        {links.map(([l, href]) => (
          <li key={l}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 text-[13px] text-textPrimary hover:text-accent">
              {l} <ExternalLink size={14} className="text-textMuted" />
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-relaxed text-textMuted">EnviroSense · Muhammad Hamza Faisal & Haydar Cukurtepe · Valparaiso University</p>
    </div>
  );
}

/* ───────────────────────────── Shell ───────────────────────────── */

const TABS: { key: Tab; label: string; icon: typeof House }[] = [
  { key: "home", label: "Field", icon: House },
  { key: "sensors", label: "Sensors", icon: Activity },
  { key: "ai", label: "AI check", icon: BrainCircuit },
  { key: "about", label: "About", icon: Info },
];

export default function DemoApp({ statusBar = true }: { statusBar?: boolean }) {
  const f = useSimulatedField();
  const [tab, setTab] = useState<Tab>("home");
  const [selected, setSelected] = useState<SensorKey>("temperature");
  const ai = useAIStore();
  const scroller = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, ""));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  const go = (t: Tab, s?: SensorKey) => {
    if (s) setSelected(s);
    setTab(t);
    scroller.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="flex h-full flex-col bg-[#0b120e] text-textPrimary selection:bg-accent/30">
      {statusBar && (
        <div className="flex h-11 shrink-0 items-end justify-between px-7 pb-1.5 text-[13px] font-semibold" aria-hidden>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{clock}</span>
          <span className="flex items-center gap-1.5">
            <svg width="17" height="11" viewBox="0 0 17 11"><g fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></g></svg>
            <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="15" height="8" rx="1.8" fill="currentColor" /><rect x="22.5" y="4" width="1.8" height="4" rx="0.9" fill="currentColor" opacity="0.4" /></svg>
          </span>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-textPrimary"><Leaf size={15} className="text-accent" /> EnviroSense</span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-textMuted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "blink-dot 2s infinite" }} /> Live · simulated
        </span>
      </div>

      <div ref={scroller} className="phone-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!f.ready ? (
          <div className="space-y-3 p-4" aria-busy>
            {[64, 96, 180, 52].map((h, i) => <div key={i} className="animate-pulse rounded-2xl bg-white/[0.04]" style={{ height: h }} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
              {tab === "home" && <Home f={f} go={go} last={ai.result} />}
              {tab === "sensors" && <Sensors f={f} selected={selected} setSelected={setSelected} />}
              {tab === "ai" && <AICheck f={f} store={ai} />}
              {tab === "about" && <About />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <nav aria-label="App" className="grid shrink-0 grid-cols-4 border-t border-white/[0.06] bg-[#0b120e]/95 px-2 pb-5 pt-2 backdrop-blur">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => go(key)} aria-current={tab === key ? "page" : undefined} className={`flex flex-col items-center gap-1 rounded-xl py-1 text-[10.5px] transition ${tab === key ? "text-accent" : "text-textMuted hover:text-textPrimary"}`}>
            <Icon size={20} strokeWidth={tab === key ? 2.2 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
