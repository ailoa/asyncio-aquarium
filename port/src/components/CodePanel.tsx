import Prism from "prismjs";
import "prismjs/components/prism-python";

type Props = {
  code: string;
  activeLine?: number;
  filename?: string;
  stepIndex: number;
  totalSteps: number;
};

export function CodePanel({ code, activeLine, filename = "main.py", stepIndex, totalSteps }: Props) {
  const lines = code.split("\n");
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
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-panel-alt)",
          fontSize: 11.5,
          color: "var(--text-dim)",
        }}
      >
        <span style={{ display: "flex", gap: 5 }}>
          <span style={dot("#f08a98")} />
          <span style={dot("#e6c172")} />
          <span style={dot("#7ed6a5")} />
        </span>
        <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{filename}</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span>line {activeLine ?? "—"}</span>
          <span style={{ color: "var(--text-mute)" }}>·</span>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>
            step {stepIndex} / {totalSteps}
          </span>
        </span>
      </div>

      <div
        className="scroll-y"
        style={{
          padding: "12px 0",
          maxHeight: 400,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13.5,
          lineHeight: 1.65,
        }}
      >
        {lines.map((line, i) => {
          const ln = i + 1;
          const isActive = ln === activeLine;
          const html = Prism.highlight(line, Prism.languages.python, "python");
          return (
            <div
              key={i}
              className="code-line"
              data-active={isActive}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 36px 1fr",
                background: isActive ? "var(--accent-soft)" : "transparent",
                position: "relative",
                whiteSpace: "pre",
                borderLeft: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                transition: "background .2s ease",
              }}
            >
              <span
                className="gutter-arrow"
                style={{
                  textAlign: "center",
                  color: "var(--accent)",
                  fontWeight: 700,
                  visibility: isActive ? "visible" : "hidden",
                }}
              >
                ▶
              </span>
              <span
                style={{
                  textAlign: "right",
                  color: "var(--text-mute)",
                  paddingRight: 10,
                  userSelect: "none",
                }}
              >
                {ln}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: line.length === 0 ? "&nbsp;" : html,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const dot = (c: string) => ({
  width: 9,
  height: 9,
  borderRadius: 999,
  background: c,
  display: "inline-block",
});
