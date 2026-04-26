import { useState } from "react";
import type { Choice } from "../simulator/types";

type Props = {
  question: string;
  choices: Choice[];
};

export function PredictionPanel({ question, choices }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const choice = choices.find((c) => c.id === selected);

  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 7 }}>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--text-mute)",
          letterSpacing: 0.7,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Predict
      </div>
      <h2 style={{ margin: "2px 0 8px", fontSize: 15, fontWeight: 600, letterSpacing: -0.1 }}>
        {question}
      </h2>

      {choices.map((c) => {
        const isSel = selected === c.id;
        const showResult = submitted && isSel;
        const stateColor = showResult
          ? c.isCorrect ? "var(--good)" : "var(--bad)"
          : isSel ? "var(--accent)" : "var(--border-strong)";
        return (
          <label
            key={c.id}
            style={{
              display: "block",
              padding: "10px 12px",
              borderRadius: 8,
              cursor: submitted ? "default" : "pointer",
              background: showResult
                ? c.isCorrect
                  ? "color-mix(in srgb, var(--good) 14%, transparent)"
                  : "color-mix(in srgb, var(--bad) 14%, transparent)"
                : isSel
                ? "var(--bg-panel-alt)"
                : "var(--bg-inset)",
              border: `1px solid ${
                showResult
                  ? c.isCorrect
                    ? "var(--good)"
                    : "var(--bad)"
                  : isSel
                  ? "var(--border-strong)"
                  : "var(--border)"
              }`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <input
                type="radio"
                name="choice"
                value={c.id}
                checked={isSel}
                disabled={submitted}
                onChange={() => setSelected(c.id)}
                style={{ display: "none" }}
              />
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  flexShrink: 0,
                  border: `1.5px solid ${stateColor}`,
                  background: isSel ? stateColor : "transparent",
                  color: "var(--accent-fg)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  marginTop: 1,
                }}
                onClick={() => !submitted && setSelected(c.id)}
              >
                {isSel && (showResult ? (c.isCorrect ? "✓" : "✕") : "•")}
              </span>
              <span
                onClick={() => !submitted && setSelected(c.id)}
                style={{
                  fontFamily: "ui-monospace, Menlo, monospace",
                  fontSize: 12.5,
                  whiteSpace: "pre",
                  color: "var(--text)",
                }}
              >
                {c.text}
              </span>
            </div>
            {showResult && (
              <div
                style={{
                  marginTop: 8,
                  marginLeft: 26,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: c.isCorrect ? "var(--good)" : "var(--bad)",
                }}
              >
                {c.feedback}
              </div>
            )}
          </label>
        );
      })}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!selected}
          style={{
            marginTop: 6,
            padding: "9px 14px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            fontWeight: 600,
            fontSize: 13,
            cursor: selected ? "pointer" : "not-allowed",
            opacity: selected ? 1 : 0.5,
          }}
        >
          Check answer
        </button>
      ) : (
        <div
          style={{
            marginTop: 6,
            padding: "8px 12px",
            borderRadius: 8,
            background: choice?.isCorrect
              ? "color-mix(in srgb, var(--good) 12%, transparent)"
              : "color-mix(in srgb, var(--bad) 12%, transparent)",
            border: `1px solid ${choice?.isCorrect ? "var(--good)" : "var(--bad)"}`,
            fontSize: 12,
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: choice?.isCorrect ? "var(--good)" : "var(--bad)", fontWeight: 700 }}>
            {choice?.isCorrect ? "Correct." : "Not quite."}
          </span>
          <span style={{ color: "var(--text-dim)" }}>
            {choice?.isCorrect ? "Now step through to see why." : "Step through to find the mistake."}
          </span>
        </div>
      )}
    </div>
  );
}
