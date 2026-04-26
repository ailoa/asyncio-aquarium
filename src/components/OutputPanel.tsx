type Props = { lines: string[] };

export function OutputPanel({ lines }: Props) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Output</div>
      <pre style={{ minHeight: 60, margin: 0 }}>
        <code>{lines.length === 0 ? "(no output yet)" : lines.join("\n")}</code>
      </pre>
    </div>
  );
}
