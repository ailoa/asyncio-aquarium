import type { Lesson } from "../simulator/types";

type Props = {
  lessons: Lesson[];
  currentId: string;
  completed: Set<string>;
  onSelect: (id: string) => void;
};

export function Sidebar({ lessons, currentId, completed, onSelect }: Props) {
  return (
    <aside
      style={{
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background:
                "linear-gradient(135deg, var(--accent), var(--status-sleeping))",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            α
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.1 }}>
              Asyncio Aquarium
            </div>
            <div
              style={{ fontSize: 10.5, color: "var(--text-mute)", marginTop: 1 }}
            >
              event-loop microscope
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "10px 14px 6px",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: "var(--text-mute)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Lessons</span>
        <span style={{ fontWeight: 500, letterSpacing: 0 }}>
          {completed.size}/{lessons.length}
        </span>
      </div>

      <nav className="scroll-y" style={{ flex: 1, padding: "0 8px" }}>
        {lessons.map((l, i) => {
          const done = completed.has(l.id);
          const current = l.id === currentId;
          const shortTitle = l.title.replace(/^Lesson \d+\s*[—-]\s*/, "");
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                padding: "7px 10px",
                borderRadius: 6,
                marginBottom: 1,
                background: current ? "var(--accent-soft)" : "transparent",
                border: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  background: done
                    ? "var(--good)"
                    : current
                    ? "var(--accent)"
                    : "transparent",
                  border:
                    done || current
                      ? "none"
                      : "1.5px solid var(--border-strong)",
                  color: done || current ? "var(--accent-fg)" : "var(--text-mute)",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 12.5,
                  color: current ? "var(--text)" : "var(--text-dim)",
                  fontWeight: current ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {shortTitle}
              </span>
            </button>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "10px 14px",
          fontSize: 11.5,
          color: "var(--text-dim)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--good)",
          }}
        />
        One thread, one event loop.
      </div>
    </aside>
  );
}
