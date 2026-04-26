import type { TraceEvent } from "../simulator/types";

type Props = {
  stepIndex: number;
  total: number;
  lastEvent?: TraceEvent;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onJump: (i: number) => void;
};

const GLYPH: Record<string, string> = {
  create_coroutine: "○", create_task: "+", start_task: "▶",
  print: "≡", await: "↯", sleep: "z", wake: "↑",
  complete: "✓", cancel: "✕", note: "·", time_advance: "⟶", raise: "!",
};

function describe(e: TraceEvent): string {
  switch (e.kind) {
    case "create_coroutine": return `coroutine ${e.label} created`;
    case "create_task": return `task ${e.label} scheduled`;
    case "start_task": return `→ run ${e.taskId}`;
    case "print": return `${e.taskId}: print(${JSON.stringify(e.value)})`;
    case "await": return `${e.taskId} await ${e.targetId}${e.yields ? " ⇢ yield" : ""}`;
    case "sleep": return `${e.taskId} sleep(${e.duration})`;
    case "wake": return `${e.taskId} wakes`;
    case "complete": return `${e.taskId} complete`;
    case "cancel": return `cancel ${e.taskId}`;
    case "raise": return `${e.taskId} raises ${e.error}`;
    case "time_advance": return `time → ${e.to}`;
    case "note": return `// ${e.text}`;
  }
}

export function Controls({ stepIndex, total, lastEvent, onPrev, onNext, onReset, onJump }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--bg-panel-alt)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      <button onClick={onPrev} disabled={stepIndex === 0} style={btn()}>← back</button>
      <button onClick={onNext} disabled={stepIndex >= total} style={btn(true)}>step →</button>
      <button onClick={onReset} style={btn()}>reset</button>

      <input
        type="range"
        min={0}
        max={total}
        value={stepIndex}
        onChange={(e) => onJump(Number(e.target.value))}
        style={{ flex: 1, marginLeft: 6 }}
      />

      <div
        style={{
          minWidth: 240,
          padding: "5px 10px",
          background: "var(--bg-inset)",
          borderRadius: 6,
          border: "1px solid var(--border)",
          fontSize: 11.5,
          fontFamily: "ui-monospace, monospace",
          color: "var(--text-dim)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "var(--accent)", fontSize: 13 }}>
          {lastEvent ? GLYPH[lastEvent.kind] ?? "·" : "·"}
        </span>
        <span style={{ color: "var(--text)" }}>
          {lastEvent ? describe(lastEvent) : "(at start)"}
        </span>
      </div>
    </div>
  );
}

function btn(primary = false): React.CSSProperties {
  return {
    padding: "6px 11px",
    borderRadius: 6,
    background: primary ? "var(--accent)" : "var(--bg-inset)",
    color: primary ? "var(--accent-fg)" : "var(--text)",
    border: `1px solid ${primary ? "var(--accent)" : "var(--border)"}`,
    fontSize: 12,
  };
}
