import type { RuntimeState } from "../simulator/types";

type Props = { state: RuntimeState };

function Column({
  title,
  subtitle,
  ids,
  state,
  accent,
}: {
  title: string;
  subtitle: string;
  ids: string[];
  state: RuntimeState;
  accent: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#161922",
        borderRadius: 8,
        padding: 12,
        minHeight: 140,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 8, lineHeight: 1.35 }}>
        {subtitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ids.map((id) => {
          const t = state.tasks[id];
          return (
            <div
              key={id}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${accent}`,
                background: "#1f2530",
                fontSize: 13,
              }}
            >
              <code>{t?.label ?? id}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AquariumView({ state }: Props) {
  const running = state.runningTaskId ? [state.runningTaskId] : [];
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Column
        title="Running"
        subtitle="The single task currently executing. Only one at a time."
        ids={running}
        state={state}
        accent="#3b82f6"
      />
      <Column
        title="Ready"
        subtitle="Queued to run. Will execute when the running task yields."
        ids={state.readyQueue}
        state={state}
        accent="#a3a3a3"
      />
      <Column
        title="Waiting / Sleeping"
        subtitle="Suspended at an await — for a timer, another task, or an event."
        ids={[...state.sleepingTaskIds, ...state.waitingTaskIds]}
        state={state}
        accent="#a37b3b"
      />
      <Column
        title="Done"
        subtitle="Finished, returned, or cancelled. Will not run again."
        ids={[...state.doneTaskIds, ...state.cancelledTaskIds]}
        state={state}
        accent="#3ba36a"
      />
    </div>
  );
}
