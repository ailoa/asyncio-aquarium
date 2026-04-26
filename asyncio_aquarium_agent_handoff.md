# Asyncio Aquarium — Agent Implementation Handoff

## Goal

Build **Asyncio Aquarium**, a small browser-based interactive learning app for Python `asyncio`.

The app should teach the mental model:

> Asyncio is one thread, one event loop, many suspended computations.  
> Control switches only when the running task reaches an `await` that cannot complete immediately.

This is not a full Python course and not a real Python interpreter.  
It is an **event-loop microscope**: users predict what happens, then step through a visual trace.

---

## Product Thesis

Most `asyncio` confusion comes from incorrect causal models:

- calling an `async def` function does not run it
- `create_task()` schedules work but does not preempt the current task
- switching is cooperative, not preemptive
- `await` may or may not yield, depending on whether the awaited thing is already complete
- `sleep(0)` is a deliberate yield point
- cancellation is injected at suspension points
- `gather()` / `TaskGroup` wait for groups of tasks

The app should make these mechanics visible.

---

## Target User

A programmer who knows basic Python and has seen `async` / `await`, but does not yet have a solid operational model of the event loop.

The app should be clear enough for a motivated beginner, but precise enough not to teach false simplifications.

---

## MVP Scope

Build a static web app with:

- React + TypeScript + Vite
- no backend
- no real Python execution
- hand-authored lesson traces
- 8 initial lessons
- multiple-choice prediction
- step-through animation / state trace
- visible runtime state:
  - running task
  - ready queue
  - sleeping/waiting tasks
  - completed tasks
  - printed output
  - timeline of events

Deployable to GitHub Pages.

---

## Non-Goals for MVP

Do **not** build these initially:

- full Python parser
- Pyodide integration
- freeform user code execution
- accounts / persistence
- scoring system beyond local lesson completion
- complex animations
- backend service
- LLM integration

The MVP should be robust, simple, and pedagogically sharp.

---

## Suggested Tech Stack

```text
Vite
React
TypeScript
Tailwind CSS
Framer Motion optional
Vitest for simulator tests
GitHub Pages deployment
```

Recommended repo shape:

```text
asyncio-aquarium/
  package.json
  vite.config.ts
  index.html
  src/
    App.tsx
    main.tsx

    simulator/
      types.ts
      initialState.ts
      applyEvent.ts
      selectors.ts
      applyEvent.test.ts

    lessons/
      index.ts
      lesson-01-coroutine-object.ts
      lesson-02-await-coroutine.ts
      lesson-03-create-task-schedules.ts
      lesson-04-task-switch-at-await.ts
      lesson-05-sleep-zero-yields.ts
      lesson-06-gather.ts
      lesson-07-cancellation.ts
      lesson-08-timeout.ts

    components/
      Layout.tsx
      LessonPicker.tsx
      CodePanel.tsx
      PredictionPanel.tsx
      AquariumView.tsx
      RuntimeStateView.tsx
      Timeline.tsx
      OutputPanel.tsx
      Controls.tsx

    styles/
      globals.css
```

---

## Core UX

Each lesson page should show:

1. Title
2. One-sentence concept
3. Code snippet
4. Prediction question
5. Multiple-choice answers
6. "Check answer" button
7. "Step through" controls
8. Visual runtime state
9. Timeline and output
10. Short explanation after completion

Suggested layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Lesson title + concept                                      │
├─────────────────────────────┬───────────────────────────────┤
│ Code panel                  │ Prediction / explanation      │
├─────────────────────────────┴───────────────────────────────┤
│ Aquarium runtime view                                       │
│                                                             │
│ Running task | Ready queue | Sleeping/waiting | Done         │
├─────────────────────────────┬───────────────────────────────┤
│ Timeline                    │ Output                        │
└─────────────────────────────┴───────────────────────────────┘
```

The user flow:

```text
read code
predict output / next event
submit answer
step through trace
watch task state changes
read compact explanation
continue to next lesson
```

---

## Visual Metaphor

Use the "aquarium" idea lightly, not cartoonishly.

Mapping:

| Asyncio concept | Visual metaphor |
|---|---|
| event loop | tank/current |
| coroutine object | fish egg / inactive fish |
| task | active fish |
| running task | fish in spotlight |
| ready queue | fish waiting in line |
| sleeping task | fish in timed cave |
| waiting task | fish at a gate |
| completed task | fish in done zone |
| cancellation | net / warning marker |

Visual clarity is more important than cute graphics.

A minimal MVP can use cards/boxes with task names and icons. Full aquarium artwork can come later.

---

## Lesson Data Model

Use authored lesson objects in TypeScript first.

```ts
export type EventKind =
  | "create_coroutine"
  | "create_task"
  | "start_task"
  | "print"
  | "await"
  | "sleep"
  | "wake"
  | "complete"
  | "cancel"
  | "raise"
  | "time_advance"
  | "note";

export type TraceEvent =
  | {
      kind: "create_coroutine";
      coroutineId: string;
      label: string;
      note?: string;
    }
  | {
      kind: "create_task";
      parentTaskId: string;
      taskId: string;
      label: string;
      note?: string;
    }
  | {
      kind: "start_task";
      taskId: string;
      note?: string;
    }
  | {
      kind: "print";
      taskId: string;
      value: string;
      note?: string;
    }
  | {
      kind: "await";
      taskId: string;
      targetId: string;
      yields: boolean;
      note?: string;
    }
  | {
      kind: "sleep";
      taskId: string;
      duration: number;
      note?: string;
    }
  | {
      kind: "wake";
      taskId: string;
      note?: string;
    }
  | {
      kind: "complete";
      taskId: string;
      result?: string;
      note?: string;
    }
  | {
      kind: "cancel";
      taskId: string;
      note?: string;
    }
  | {
      kind: "raise";
      taskId: string;
      error: string;
      note?: string;
    }
  | {
      kind: "time_advance";
      to: number;
      note?: string;
    }
  | {
      kind: "note";
      text: string;
    };

export type Choice = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

export type Lesson = {
  id: string;
  title: string;
  concept: string;
  code: string;
  question: string;
  choices: Choice[];
  trace: TraceEvent[];
  explanation: string;
};
```

---

## Runtime State Model

The visual state should be derived by replaying trace events.

```ts
export type TaskStatus =
  | "ready"
  | "running"
  | "sleeping"
  | "waiting"
  | "done"
  | "cancelled"
  | "error";

export type Task = {
  id: string;
  label: string;
  status: TaskStatus;
  waitingFor?: string;
  wakeAt?: number;
  result?: string;
  error?: string;
};

export type CoroutineObject = {
  id: string;
  label: string;
  consumed: boolean;
};

export type RuntimeState = {
  time: number;
  runningTaskId?: string;
  readyQueue: string[];
  sleepingTaskIds: string[];
  waitingTaskIds: string[];
  doneTaskIds: string[];
  cancelledTaskIds: string[];
  tasks: Record<string, Task>;
  coroutineObjects: Record<string, CoroutineObject>;
  output: string[];
  timeline: TraceEvent[];
};
```

---

## Important Semantic Rules to Encode

These rules should guide lessons and event traces.

### 1. Calling `async def` creates a coroutine object

```python
async def hello():
    print("hello")

c = hello()
print("done")
```

Output:

```text
done
```

`hello()` creates a coroutine object. It does not run the body.

---

### 2. `await coro` runs/resumes the coroutine

```python
async def hello():
    print("hello")
    return 42

async def main():
    x = await hello()
    print(x)
```

Output:

```text
hello
42
```

---

### 3. `create_task(coro)` schedules the coroutine as a Task

```python
async def worker():
    print("worker")

async def main():
    asyncio.create_task(worker())
    print("main")
    await asyncio.sleep(0)
```

Output:

```text
main
worker
```

Key point:

`create_task()` does not interrupt `main`.  
`worker` runs only after `main` yields.

---

### 4. Task switching is cooperative

A running task continues until it:

- awaits something incomplete
- returns
- raises an exception

There is no preemption between ordinary Python statements.

---

### 5. `await asyncio.sleep(0)` is a yield point

It lets other ready tasks run.

---

### 6. Awaiting an already-complete object may not yield

This is an important advanced nuance. It can be introduced later.

---

### 7. Cancellation is delivered at await points

A cancelled task usually receives `CancelledError` the next time it resumes at an await boundary.

For MVP, keep this simplified and explicit.

---

## Initial Lessons

### Lesson 1 — Async function call does not run body

Code:

```python
async def hello():
    print("hello")

coro = hello()
print("done")
```

Question:

```text
What gets printed?
```

Correct answer:

```text
done
```

Concept:

```text
Calling an async function creates a coroutine object. It does not run it.
```

Trace idea:

```ts
[
  { kind: "create_coroutine", coroutineId: "coro-hello", label: "hello()" },
  { kind: "print", taskId: "sync-main", value: "done" },
  { kind: "note", text: "The coroutine was created but never awaited or scheduled." }
]
```

---

### Lesson 2 — Awaiting a coroutine runs it

Code:

```python
import asyncio

async def hello():
    print("hello")
    return 42

async def main():
    x = await hello()
    print(x)

asyncio.run(main())
```

Correct output:

```text
hello
42
```

Concept:

```text
Awaiting a coroutine runs it until it returns or suspends.
```

---

### Lesson 3 — `create_task` schedules but does not preempt

Code:

```python
import asyncio

async def worker():
    print("worker")

async def main():
    asyncio.create_task(worker())
    print("main")
    await asyncio.sleep(0)

asyncio.run(main())
```

Correct output:

```text
main
worker
```

Concept:

```text
create_task schedules work, but the current task keeps running until it yields.
```

---

### Lesson 4 — Switching only happens at await

Code:

```python
import asyncio

async def worker():
    print("A")
    await asyncio.sleep(0)
    print("B")

async def main():
    task = asyncio.create_task(worker())
    print("C")
    await task
    print("D")

asyncio.run(main())
```

Correct output:

```text
C
A
B
D
```

Concept:

```text
The worker starts only when main reaches an await.
```

---

### Lesson 5 — Two tasks interleave at sleeps

Code:

```python
import asyncio

async def worker(name):
    print(name, "1")
    await asyncio.sleep(0)
    print(name, "2")

async def main():
    t1 = asyncio.create_task(worker("A"))
    t2 = asyncio.create_task(worker("B"))
    await t1
    await t2

asyncio.run(main())
```

Plausible output for the teaching model:

```text
A 1
B 1
A 2
B 2
```

Concept:

```text
Tasks interleave only when they yield.
```

Note:

Be careful with CPython version details. The app can state it is using a simplified event-loop model for teaching where ready tasks run FIFO.

---

### Lesson 6 — `gather` waits for many tasks

Code:

```python
import asyncio

async def worker(name):
    print(name, "start")
    await asyncio.sleep(0)
    print(name, "end")

async def main():
    await asyncio.gather(worker("A"), worker("B"))
    print("done")

asyncio.run(main())
```

Teaching output:

```text
A start
B start
A end
B end
done
```

Concept:

```text
gather schedules/awaits multiple awaitables and resumes when all are done.
```

---

### Lesson 7 — Cancellation

Code:

```python
import asyncio

async def worker():
    try:
        print("start")
        await asyncio.sleep(10)
        print("end")
    except asyncio.CancelledError:
        print("cancelled")
        raise

async def main():
    task = asyncio.create_task(worker())
    await asyncio.sleep(0)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("main saw cancellation")

asyncio.run(main())
```

Teaching output:

```text
start
cancelled
main saw cancellation
```

Concept:

```text
Cancellation is delivered into the task at an await boundary.
```

---

### Lesson 8 — Timeout

Code:

```python
import asyncio

async def slow():
    await asyncio.sleep(10)
    return "done"

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=1)
    except asyncio.TimeoutError:
        print("timeout")

asyncio.run(main())
```

Teaching output:

```text
timeout
```

Concept:

```text
A timeout cancels the inner awaitable if it does not finish in time.
```

---

## Component Responsibilities

### `App.tsx`

- load lesson list
- track selected lesson
- manage lesson progress state

### `LessonPicker.tsx`

- list lessons
- show completed/current state locally

### `CodePanel.tsx`

- render code with syntax highlighting
- can use plain `<pre><code>` initially
- avoid heavy dependencies unless useful

### `PredictionPanel.tsx`

- show question
- show choices
- handle answer submission
- show feedback

### `AquariumView.tsx`

- main visualization
- render task cards by state:
  - running
  - ready
  - sleeping/waiting
  - done/cancelled/error

### `Timeline.tsx`

- render trace events up to current step
- highlight current event
- show event notes

### `OutputPanel.tsx`

- show printed output so far

### `Controls.tsx`

- previous step
- next step
- reset
- auto-play optional, not necessary for v0.1

---

## State Management

Keep it simple.

Use React state:

```ts
const [lessonId, setLessonId] = useState(...)
const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
const [hasAnswered, setHasAnswered] = useState(false)
const [stepIndex, setStepIndex] = useState(0)
```

Derive current runtime state by replaying:

```ts
const runtimeState = useMemo(
  () => replayTrace(lesson.trace.slice(0, stepIndex)),
  [lesson, stepIndex]
);
```

For MVP, replaying from scratch is simpler and less error-prone than mutating state incrementally.

---

## Simulator Functions

Implement:

```ts
export function createInitialState(): RuntimeState;

export function applyEvent(
  state: RuntimeState,
  event: TraceEvent
): RuntimeState;

export function replayTrace(events: TraceEvent[]): RuntimeState {
  return events.reduce(applyEvent, createInitialState());
}
```

Add tests for:

- `create_task` adds to ready queue
- `start_task` moves from ready to running
- `print` appends to output
- `sleep` moves running task to sleeping
- `wake` moves sleeping task to ready
- `complete` moves running task to done
- `cancel` moves task to cancelled
- replaying lesson 3 gives output `["main", "worker"]`

---

## Styling Direction

Use a clean, minimal visual style:

- dark or light neutral background
- rounded cards
- task cards as colored/outlined pills
- clear labels
- avoid visual clutter
- make the runtime state obvious at a glance

Suggested visual hierarchy:

```text
big: current concept
medium: code + prediction
high-contrast: running task and current event
secondary: queue/waiting/done states
```

---

## Deployment

Use GitHub Pages.

Vite config for project page:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/asyncio-aquarium/",
});
```

Add GitHub Actions workflow:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

---

## Acceptance Criteria for v0.1

The implementation is complete when:

- app runs locally with `npm run dev`
- app builds with `npm run build`
- app has 8 lessons
- each lesson has:
  - code
  - concept
  - prediction question
  - at least 3 choices
  - trace
  - explanation
- selecting an answer shows correct/incorrect feedback
- user can step forward/backward through trace
- runtime view updates correctly from trace
- output panel shows printed output so far
- timeline shows events so far and highlights current event
- app can be deployed as a static site
- no backend required
- simulator has unit tests for core event transitions

---

## Quality Bar

Prefer simple and correct over fancy.

The app should feel like:

```text
small sharp examples
visible state
immediate feedback
one concept per level
```

Avoid:

```text
long explanations
too many concepts per lesson
ambiguous nondeterministic examples
overly cute visuals that hide mechanics
freeform code execution before the model is stable
```

---

## Future Extensions

After v0.1:

### Mini DSL

Allow lessons to be written in a small async DSL:

```text
task worker:
  print "A"
  sleep 0
  print "B"

main:
  create worker
  print "main"
  await worker
```

Compile this DSL into traces.

### Pyodide mode

Run real Python in browser for advanced exploration.

Only do this after the hand-authored model is good.

### More lessons

- `async with`
- async generators
- `async for`
- queues
- producer/consumer
- semaphores
- locks
- shields
- `TaskGroup`
- exception propagation in `gather`
- difference between coroutine, Task, and Future
- CPU-bound blocking code freezes the loop
- `to_thread`

### Advanced visualizations

- timeline swimlanes
- event-loop tick counter
- task dependency graph
- cancellation propagation
- hover explanations for each event

---

## Implementation Strategy

Recommended sequence:

1. Create Vite React TS project.
2. Add static lesson objects with only lesson 1.
3. Implement `TraceEvent`, `RuntimeState`, `applyEvent`, `replayTrace`.
4. Implement basic layout without animations.
5. Implement prediction panel.
6. Implement step controls.
7. Implement runtime state view.
8. Add lessons 2–5.
9. Add tests for simulator.
10. Add lessons 6–8.
11. Polish UI.
12. Add GitHub Pages workflow.

Do not start with animations or Pyodide.

The first useful version is a clear static trace visualizer.

---

## Key Design Principle

Every lesson should answer one question:

> What does the event loop know right now, and why is this task allowed to run next?

If the app makes that visible, it succeeds.
