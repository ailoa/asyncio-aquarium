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
    <div>
      <h3 style={{ marginTop: 0 }}>{question}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {choices.map((c) => (
          <label
            key={c.id}
            style={{
              padding: "8px 10px",
              border: "1px solid #2a2f3a",
              borderRadius: 6,
              background:
                submitted && selected === c.id
                  ? c.isCorrect
                    ? "#143b1f"
                    : "#3b1414"
                  : selected === c.id
                  ? "#1f2530"
                  : "transparent",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="choice"
              value={c.id}
              checked={selected === c.id}
              disabled={submitted}
              onChange={() => setSelected(c.id)}
              style={{ marginRight: 8 }}
            />
            <code style={{ whiteSpace: "pre-wrap" }}>{c.text}</code>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => setSubmitted(true)}
          disabled={!selected || submitted}
          style={{
            padding: "6px 14px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            opacity: !selected || submitted ? 0.5 : 1,
          }}
        >
          Check answer
        </button>
        {submitted && choice && (
          <p style={{ marginTop: 12, color: choice.isCorrect ? "#7ee08a" : "#f08a8a" }}>
            {choice.feedback}
          </p>
        )}
      </div>
    </div>
  );
}
