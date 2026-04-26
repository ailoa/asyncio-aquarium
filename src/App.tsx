import { useMemo, useState } from "react";
import { lessons } from "./lessons";
import { replayTrace } from "./simulator/applyEvent";
import { CodePanel } from "./components/CodePanel";
import { PredictionPanel } from "./components/PredictionPanel";
import { AquariumView } from "./components/AquariumView";
import { Timeline } from "./components/Timeline";
import { OutputPanel } from "./components/OutputPanel";
import { Controls } from "./components/Controls";

export function App() {
  const [lessonId, setLessonId] = useState(lessons[0].id);
  const lesson = lessons.find((l) => l.id === lessonId)!;
  const [stepIndex, setStepIndex] = useState(0);

  const state = useMemo(
    () => replayTrace(lesson.trace.slice(0, stepIndex)),
    [lesson, stepIndex]
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Asyncio Aquarium</h1>
        <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: 14 }}>
          One thread, one event loop, many suspended computations.
        </p>
      </header>

      <nav style={{ marginBottom: 16 }}>
        <select
          value={lessonId}
          onChange={(e) => {
            setLessonId(e.target.value);
            setStepIndex(0);
          }}
          style={{
            padding: "6px 10px",
            background: "#1f2530",
            color: "#e6e6e6",
            border: "1px solid #2a2f3a",
            borderRadius: 6,
          }}
        >
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </nav>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>{lesson.title}</h2>
        <p style={{ margin: 0, opacity: 0.85 }}>{lesson.concept}</p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <CodePanel
          code={lesson.code}
          activeLine={stepIndex > 0 ? lesson.trace[stepIndex - 1]?.line : undefined}
        />
        <PredictionPanel question={lesson.question} choices={lesson.choices} />
      </div>

      <section style={{ marginBottom: 16 }}>
        <Controls
          stepIndex={stepIndex}
          total={lesson.trace.length}
          onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
          onNext={() => setStepIndex((i) => Math.min(lesson.trace.length, i + 1))}
          onReset={() => setStepIndex(0)}
        />
      </section>

      <section style={{ marginBottom: 16 }}>
        <AquariumView state={state} />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Timeline events={state.timeline} total={lesson.trace.length} currentIndex={stepIndex} />
        <OutputPanel lines={state.output} />
      </div>

      {stepIndex >= lesson.trace.length && (
        <section
          style={{
            marginTop: 20,
            padding: 12,
            background: "#161922",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          <strong>Why:</strong> {lesson.explanation}
        </section>
      )}
    </div>
  );
}
