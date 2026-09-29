import type { ApiStatus } from "@/hooks/useApiStatus";

const LABEL: Record<ApiStatus, string> = {
  checking: "Connecting to model…",
  waking: "Waking model (free tier, ~30s)…",
  online: "Model online",
  offline: "Model unreachable",
};

export default function StatusDot({ status }: { status: ApiStatus }) {
  const color = status === "online" ? "bg-accent" : status === "offline" ? "bg-red-400" : "bg-amber";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-textMuted">
      <span className={`h-2 w-2 rounded-full ${color}`} style={status === "online" ? undefined : { animation: "blink-dot 1.2s infinite" }} />
      {LABEL[status]}
    </span>
  );
}
