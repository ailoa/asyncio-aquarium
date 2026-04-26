import type { TraceEvent } from "../simulator/types";

type Props = {
  events: TraceEvent[];
  total: number;
  currentIndex: number;
};

function describe(e: TraceEvent): string {
  switch (e.kind) {
    case "create_coroutine":
      return `create coroutine ${e.label}`;
    case "create_task":
      return `create_task(${e.label})`;
    case "start_task":
      return `→ run ${e.taskId}`;
    case "print":
      return `${e.taskId}: print(${JSON.stringify(e.value)})`;
    case "await":
      return `${e.taskId} await ${e.targetId}${e.yields ? " (yields)" : " (no yield)"}`;
    case "sleep":
      return `${e.taskId} sleep(${e.duration})`;
    case "wake":
      return `${e.taskId} wakes`;
    case "complete":
      return `${e.taskId} complete${e.result ? ` → ${e.result}` : ""}`;
    case "cancel":
      return `cancel ${e.taskId}`;
    case "raise":
      return `${e.taskId} raises ${e.error}`;
    case "time_advance":
      return `time → ${e.to}`;
    case "note":
      return `// ${e.text}`;
  }
}

export function Timeline({ events, total, currentIndex }: Props) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
        Timeline ({events.length} / {total})
      </div>
      <ol style={{ paddingLeft: 18, margin: 0 }}>
        {events.map((e, i) => (
          <li
            key={i}
            style={{
              fontSize: 13,
              padding: "2px 0",
              fontWeight: i === currentIndex - 1 ? 600 : 400,
              color: i === currentIndex - 1 ? "#e6e6e6" : "#a8a8a8",
            }}
          >
            <code>{describe(e)}</code>
            {"note" in e && e.note ? (
              <div style={{ fontSize: 12, opacity: 0.7, paddingLeft: 4 }}>{e.note}</div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
