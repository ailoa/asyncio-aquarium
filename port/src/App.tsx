import { useEffect, useMemo, useState } from "react";
import { lessons } from "./lessons";
import { replayTrace } from "./simulator/applyEvent";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { CodePanel } from "./components/CodePanel";
import { Controls } from "./components/Controls";
import { AquariumView } from "./components/AquariumView";
import { Timeline } from "./components/Timeline";
import { OutputPanel } from "./components/OutputPanel";
import { PredictionPanel } from "./components/PredictionPanel";
import { WhyCard } from "./components/WhyCard";

export function App() {
  const [lessonId, setLessonId] = useState(lessons[0].id);
  const lesson = lessons.find((l) => l.id === lessonId)!;
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Apply theme to <html> so CSS vars switch.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const state = useMemo(
    () => replayTrace(lesson.trace.slice(0, stepIndex)),
    [lesson, stepIndex]
  );

  const activeLine = useMemo(() => {
    for (let i = stepIndex - 1; i >= 0; i--) {
      const line = lesson.trace[i]?.line;
      if (line !== undefined) return line;
    }
    return undefined;
  }, [lesson, stepIndex]);

  const lastEvent = lesson.trace[stepIndex - 1];
  const isComplete = stepIndex >= lesson.trace.length;
  useEffect(() => {
    if (isComplete) setCompleted((s) => new Set(s).add(lesson.id));
  }, [isComplete, lesson.id]);

  // Lesson number from index in array
  const lessonNumber = lessons.findIndex((l) => l.id === lesson.id) + 1;
  // Strip "Lesson N — " prefix from title for the header (Sidebar already has the number)
  const cleanTitle = lesson.title.replace(/^Lesson \d+\s*[—-]\s*/, "");

  // Keyboard shortcuts: ← → for stepping
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") setStepIndex((i) => Math.min(lesson.trace.length, i + 1));
      else if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lesson.trace.length]);

  const prev = lessons[lessonNumber - 2];
  const next = lessons[lessonNumber];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "240px 1fr 360px",
        background: "var(--bg)",
        color: "var(--text)",
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <Sidebar
        lessons={lessons}
        currentId={lessonId}
        completed={completed}
        onSelect={(id) => {
          setLessonId(id);
          setStepIndex(0);
        }}
      />

      <main style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          lessonNumber={lessonNumber}
          total={lessons.length}
          title={cleanTitle}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />

        <div
          style={{
            margin: "14px 22px 0",
            padding: "11px 14px",
            background: "var(--bg-panel)",
            borderLeft: "2px solid var(--accent)",
            borderRadius: "0 6px 6px 0",
            fontSize: 13.5,
          }}
        >
          {lesson.concept}
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <CodePanel
            code={lesson.code}
            activeLine={activeLine}
            stepIndex={stepIndex}
            totalSteps={lesson.trace.length}
          />
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <Controls
            stepIndex={stepIndex}
            total={lesson.trace.length}
            lastEvent={lastEvent}
            onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
            onNext={() => setStepIndex((i) => Math.min(lesson.trace.length, i + 1))}
            onReset={() => setStepIndex(0)}
            onJump={setStepIndex}
          />
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <AquariumView state={state} />
        </div>

        <div
          style={{
            padding: "14px 22px 18px",
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 14,
            flex: "1 1 auto",
            minHeight: 0,
          }}
        >
          <OutputPanel timeline={state.timeline} />
          <Timeline
            events={state.timeline}
            total={lesson.trace.length}
            currentIndex={stepIndex}
            onJump={setStepIndex}
          />
        </div>
      </main>

      <aside
        style={{
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px 18px 0", borderBottom: "1px solid var(--border)" }}>
          <PredictionPanel
            key={lesson.id}
            question={lesson.question}
            choices={lesson.choices}
          />
        </div>

        <WhyCard explanation={lesson.explanation} />

        <div
          style={{
            marginTop: "auto",
            padding: "12px 14px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 8,
          }}
        >
          <button
            disabled={!prev}
            onClick={() => prev && (setLessonId(prev.id), setStepIndex(0))}
            style={navBtn(false)}
          >
            ← {prev ? `Lesson ${lessonNumber - 1}` : "—"}
          </button>
          <button
            disabled={!next}
            onClick={() => next && (setLessonId(next.id), setStepIndex(0))}
            style={navBtn(true)}
          >
            {next ? `Lesson ${lessonNumber + 1}` : "End"} →
          </button>
        </div>
      </aside>
    </div>
  );
}

function navBtn(primary: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "8px 11px",
    borderRadius: 6,
    background: primary ? "var(--accent)" : "var(--bg-inset)",
    color: primary ? "var(--accent-fg)" : "var(--text)",
    border: `1px solid ${primary ? "var(--accent)" : "var(--border)"}`,
    fontSize: 12,
  };
}
