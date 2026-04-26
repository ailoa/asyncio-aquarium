type Props = {
  stepIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
};

export function Controls({ stepIndex, total, onPrev, onNext, onReset }: Props) {
  const btn = {
    padding: "6px 12px",
    background: "#1f2530",
    border: "1px solid #2a2f3a",
    color: "#e6e6e6",
    borderRadius: 6,
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button style={btn} onClick={onPrev} disabled={stepIndex === 0}>
        ← Back
      </button>
      <button style={btn} onClick={onNext} disabled={stepIndex >= total}>
        Step →
      </button>
      <button style={btn} onClick={onReset}>
        Reset
      </button>
      <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
        step {stepIndex} / {total}
      </span>
    </div>
  );
}
