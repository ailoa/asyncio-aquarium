import type { RuntimeState, Task } from "../simulator/types";

type Props = { state: RuntimeState };

function TaskChip({ task }: { task: Task }) {
  const color = `var(--status-${task.status})`;
  return (
    <div
      className="task-chip"
      data-running={task.status === "running"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 9px",
        borderRadius: 999,
        background: "var(--bg-inset)",
        border: `1px solid ${color}`,
        fontSize: 12,
        fontFamily: "ui-monospace, Menlo, monospace",
        color: "var(--text)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
        }}
      />
      <span>{task.label}</span>
    </div>
  );
}

function Zone({
  title,
  hint,
  ids,
  state,
  color,
  isLast,
}: {
  title: string;
  hint: string;
  ids: string[];
  state: RuntimeState;
  color: string;
  isLast?: boolean;
}) {
  const tasks = ids.map((id) => state.tasks[id]).filter(Boolean);
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "10px 14px",
        borderRight: isLast ? "none" : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 110,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: color,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          {title}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--text-mute)",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {tasks.length}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-mute)",
          lineHeight: 1.4,
          marginTop: -4,
        }}
      >
        {hint}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tasks.length === 0 ? (
          <span
            style={{
              color: "var(--text-mute)",
              fontSize: 11,
              fontStyle: "italic",
            }}
          >
            —
          </span>
        ) : (
          tasks.map((t) => <TaskChip key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}

export function AquariumView({ state }: Props) {
  const taskCount = Object.keys(state.tasks).length;
  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          borderBottom: "1px solid var(--border)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "var(--text-dim)",
          background: "var(--bg-panel-alt)",
        }}
      >
        <span>runtime state</span>
        <span style={{ color: "var(--text-mute)", fontWeight: 500, letterSpacing: 0 }}>
          · t = {state.time}
        </span>
        <span
          style={{
            marginLeft: "auto",
            color: "var(--text-mute)",
            letterSpacing: 0,
            fontWeight: 500,
          }}
        >
          {taskCount} task{taskCount !== 1 && "s"}
        </span>
      </div>
      <div style={{ display: "flex" }}>
        <Zone
          title="Running"
          hint="The single executing task."
          color="var(--status-running)"
          ids={state.runningTaskId ? [state.runningTaskId] : []}
          state={state}
        />
        <Zone
          title="Ready"
          hint="Waiting for the running task to yield."
          color="var(--status-ready)"
          ids={state.readyQueue}
          state={state}
        />
        <Zone
          title="Sleeping / Waiting"
          hint="Suspended at await."
          color="var(--status-waiting)"
          ids={[...state.sleepingTaskIds, ...state.waitingTaskIds]}
          state={state}
        />
        <Zone
          title="Done"
          hint="Completed or cancelled."
          color="var(--status-done)"
          ids={[...state.doneTaskIds, ...state.cancelledTaskIds]}
          state={state}
          isLast
        />
      </div>
    </div>
  );
}
