import Prism from "prismjs";
import "prismjs/components/prism-python";

type Props = { code: string };

export function CodePanel({ code }: Props) {
  const html = Prism.highlight(code, Prism.languages.python, "python");
  return (
    <pre className="language-python">
      <code className="language-python" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
