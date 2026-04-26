type Props = { explanation: string };

export function WhyCard({ explanation }: Props) {
  return (
    <div
      style={{
        margin: "8px 14px 14px",
        padding: "12px 14px",
        borderRadius: 10,
        background: "linear-gradient(180deg, var(--accent-soft), transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "var(--accent)",
            color: "var(--accent-fg)",
            display: "grid",
            placeItems: "center",
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          i
        </span>
        Why
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--text)" }}>
        {explanation}
      </p>
    </div>
  );
}
