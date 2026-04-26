type Props = { code: string };

export function CodePanel({ code }: Props) {
  return (
    <pre>
      <code>{code}</code>
    </pre>
  );
}
