import type { TraceEvent } from "../simulator/types";

type Props = {
  events: TraceEvent[];
  total: number;
  currentIndex: number;
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

export function Timeline({ events, total, currentIndex, onJump }: Props) {
  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-panel-alt)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "var(--text-dim)",
          display: "flex",
        }}
      >
        event timeline
        <span
          style={{
            marginLeft: "auto",
            color: "var(--text-mute)",
            fontWeight: 500,
            letterSpacing: 0,
          }}
        >
          {currentIndex} / {total}
        </span>
      </div>
      <div className="scroll-y" style={{ flex: 1, padding: "6px 0", maxHeight: 280 }}>
        {events.map((e, i) => {
          const past = i < currentIndex;
          const cur = i === currentIndex - 1;
          return (
            <button
              key={i}
              onClick={() => onJump(i + 1)}
              style={{
                display: "grid",
                gridTemplateColumns: "30px 18px 1fr auto",
                padding: "3px 14px",
                width: "100%",
                alignItems: "center",
                gap: 8,
                background: cur ? "var(--accent-soft)" : "transparent",
                color: past ? "var(--text)" : "var(--text-mute)",
                opacity: past ? 1 : 0.55,
                fontSize: 12,
                fontFamily: "ui-monospace, Menlo, monospace",
                borderLeft: cur
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                border: "none",
                textAlign: "left",
              }}
            >
              <span style={{ color: "var(--text-mute)", textAlign: "right" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ color: past ? "var(--accent)" : "var(--text-mute)" }}>
                {GLYPH[e.kind] ?? "·"}
              </span>
              <span>{describe(e)}</span>
              {"line" in e && e.line ? (
                <span style={{ color: "var(--text-mute)", fontSize: 11 }}>L{e.line}</span>
              ) : (
                <span />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
