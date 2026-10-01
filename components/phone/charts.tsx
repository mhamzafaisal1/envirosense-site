"use client";

import { useId } from "react";
import type { Point } from "@/lib/field";

type Props = { points: Point[]; range?: [number, number]; width: number; height: number };

function scale(points: Point[], range: [number, number] | undefined, width: number, height: number, pad: number) {
  const vals = points.map(p => p.v);
  let lo = Math.min(...vals, ...(range ? [range[0]] : []));
  let hi = Math.max(...vals, ...(range ? [range[1]] : []));
  const span = hi - lo || 1;
  lo -= span * 0.12;
  hi += span * 0.12;
  const x = (i: number) => pad + (i / Math.max(1, points.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / (hi - lo)) * (height - pad * 2);
  return { x, y };
}

/** Mini trend line for sensor tiles. */
export function Trend({ points, width, height, tone = "#4ade80" }: { points: Point[]; width: number; height: number; tone?: string }) {
  if (points.length < 2) return <svg width={width} height={height} aria-hidden />;
  const { x, y } = scale(points, undefined, width, height, 2);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
  return (
    <svg width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke={tone} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    </svg>
  );
}

/** 24h area chart with the healthy band shaded and hour labels. */
export function DayChart({ points, range, width, height }: Props) {
  const id = useId().replace(/:/g, "");
  if (points.length < 2) return <div style={{ width, height }} />;
  const pad = 10;
  const { x, y } = scale(points, range, width, height - 18, pad);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1).toFixed(1)},${height - 18 - pad}L${x(0).toFixed(1)},${height - 18 - pad}Z`;
  const last = points[points.length - 1];
  const labels = [0, 6, 12, 18, points.length - 1];
  return (
    <svg width={width} height={height} role="img" aria-label="Last 24 hours">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
        </linearGradient>
      </defs>
      {range && (
        <g>
          <rect x={pad} width={width - pad * 2} y={y(range[1])} height={Math.max(0, y(range[0]) - y(range[1]))} fill="#4ade80" opacity={0.07} />
          <line x1={pad} x2={width - pad} y1={y(range[1])} y2={y(range[1])} stroke="#4ade80" strokeOpacity={0.25} strokeDasharray="3 4" />
          <line x1={pad} x2={width - pad} y1={y(range[0])} y2={y(range[0])} stroke="#4ade80" strokeOpacity={0.25} strokeDasharray="3 4" />
        </g>
      )}
      <path d={area} fill={`url(#g${id})`} />
      <path d={line} fill="none" stroke="#4ade80" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(last.v)} r={7} fill="#4ade80" opacity={0.18} />
      <circle cx={x(points.length - 1)} cy={y(last.v)} r={3.5} fill="#4ade80" />
      {labels.map(i => (
        <text key={i} x={x(i)} y={height - 3} fill="#9ab8a0" fontSize={10} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} style={{ fontVariantNumeric: "tabular-nums" }}>
          {i === points.length - 1 ? "now" : new Date(points[i].t).toLocaleTimeString([], { hour: "numeric" })}
        </text>
      ))}
    </svg>
  );
}
