import type { TraceEvent } from "../simulator/types";

type Props = { timeline: TraceEvent[] };

export function OutputPanel({ timeline }: Props) {
  const prints = timeline.filter((e) => e.kind === "print") as Extract<
    TraceEvent,
    { kind: "print" }
  >[];
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
        }}
      >
        stdout
      </div>
      <div
        className="scroll-y"
        style={{
          padding: 14,
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 13,
          color: "var(--text)",
          flex: 1,
          background: "var(--bg-inset)",
          minHeight: 80,
        }}
      >
        {prints.length === 0 ? (
          <span style={{ color: "var(--text-mute)", fontStyle: "italic" }}>
            (no output yet)
          </span>
        ) : (
          prints.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--text-mute)", width: 60, flexShrink: 0 }}>
                {p.taskId}
              </span>
              <span>{p.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
