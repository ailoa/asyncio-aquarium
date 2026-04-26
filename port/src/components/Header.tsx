type Props = {
  lessonNumber: number;
  total: number;
  title: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function Header({ lessonNumber, total, title, theme, onToggleTheme }: Props) {
  return (
    <header
      style={{
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-mute)",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Lesson {String(lessonNumber).padStart(2, "0")} of {total}
        </div>
        <h1
          style={{
            margin: "2px 0 0",
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </h1>
      </div>
      <button
        onClick={onToggleTheme}
        style={{
          padding: "5px 9px",
          fontSize: 11.5,
          background: "var(--bg-panel-alt)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          borderRadius: 6,
        }}
      >
        {theme === "dark" ? "◐ dark" : "◑ light"}
      </button>
    </header>
  );
}
