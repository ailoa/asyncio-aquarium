import Prism from "prismjs";
import "prismjs/components/prism-python";

type Props = {
  code: string;
  activeLine?: number;
};

export function CodePanel({ code, activeLine }: Props) {
  const lines = code.split("\n");
  return (
    <pre className="language-python" style={{ padding: 0, overflow: "hidden" }}>
      <code className="language-python" style={{ display: "block" }}>
        {lines.map((line, i) => {
          const lineNo = i + 1;
          const isActive = lineNo === activeLine;
          const html = Prism.highlight(line, Prism.languages.python, "python");
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 28px 1fr",
                background: isActive ? "rgba(59, 130, 246, 0.12)" : "transparent",
                borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                padding: "0 12px 0 0",
              }}
            >
              <span
                aria-hidden
                style={{
                  textAlign: "center",
                  color: "#3b82f6",
                  fontWeight: 700,
                  visibility: isActive ? "visible" : "hidden",
                }}
              >
                ▶
              </span>
              <span
                style={{
                  textAlign: "right",
                  color: "#4b5563",
                  paddingRight: 8,
                  userSelect: "none",
                }}
              >
                {lineNo}
              </span>
              <span dangerouslySetInnerHTML={{ __html: line.length === 0 ? "&nbsp;" : html }} />
            </div>
          );
        })}
      </code>
    </pre>
  );
}
