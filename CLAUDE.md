# Asyncio Aquarium

Interactive step-through visualiser for Python asyncio concepts. Built with React + TypeScript + Vite. Deployed to GitHub Pages at `/asyncio-aquarium/`.

## Commands

```bash
pnpm dev          # dev server on http://localhost:5173
pnpm build        # tsc -b && vite build → dist/
pnpm test         # vitest run (single pass)
pnpm test:watch   # vitest (watch mode)
pnpm tsc --noEmit # type-check only
```

## Architecture

### Simulator (pure functions, no React)

`src/simulator/types.ts` — all types. Key ones:
- `TraceEvent` — discriminated union of all event kinds, intersected with `EventBase { line?: number }` so every event can carry an optional source line
- `RuntimeState` — the full visualiser state: tasks, queues, output log, timeline
- `Lesson` — the data shape each lesson exports

`src/simulator/applyEvent.ts` — `applyEvent(state, event) → state` (pure reducer). `replayTrace(events)` folds the full trace. **Never mutate state.**

`src/simulator/initialState.ts` — `createInitialState()`.

### Lessons

`src/lessons/lesson-NN-slug.ts` — each file exports one `Lesson` object. Fields:
- `id`, `title`, `concept` — metadata
- `code` — Python source shown in the code panel
- `question`, `choices[]` — prediction quiz
- `trace: TraceEvent[]` — deterministic event log; every event that maps to a line should have `line` set
- `explanation` — shown in the WHY card after completing all steps

`src/lessons/index.ts` — re-exports the ordered `lessons` array. Add new lessons here.

**Rules for lesson traces:**
- All `choice.text` values use real `\n`, not `\\n`
- Every event that corresponds to a line of code should have `line` set (notes inherit the previous line via backward-walk in App.tsx)
- Examples must be deterministic — no output that depends on scheduling order

### Components

| Component | Role |
|---|---|
| `App.tsx` | Root state: `lessonId`, `stepIndex`, `completed`, `theme`, `view` ("lesson" \| "reference"). `activeLine` walks backward from `stepIndex-1` to find the most recent event with a `line`. |
| `Sidebar` | Lesson list + "In the Wild" nav item. Lesson highlight suppressed when `view === "reference"`. |
| `CodePanel` | Per-line Prism highlighting. Active line gets pulsing arrow via CSS. Never has vertical scroll (no `maxHeight`). |
| `PredictionPanel` | Prediction quiz. Keyed on `lesson.id` to reset between lessons. |
| `AquariumView` | Task chip pills with status colours. |
| `Controls` | Back/step/reset buttons + range slider. Shows last event description. |
| `Timeline` | Clickable event log; calls `onJump(i+1)`. |
| `WhyCard` | Explanation card — only rendered when `isComplete` (`stepIndex >= trace.length`). |
| `ReferencePage` | Static "In the Wild" reference mapping library patterns to lessons. Spans full content area when active. Lesson pill buttons navigate to the relevant lesson. |

### Styling

`src/styles/globals.css` — CSS variables only, no utility classes. Dark default, `[data-theme="light"]` override applied to `<html>`. Status colours: `--status-running/ready/waiting/sleeping/done/cancelled`. Syntax colours: `--syntax-kw/fn/str/num/com/p`.

Prism token colours are driven by CSS vars, not Prism themes.

## Adding a lesson

1. Create `src/lessons/lesson-NN-slug.ts` and export a `Lesson`
2. Import and append it in `src/lessons/index.ts`
3. Add an output assertion in `src/simulator/applyEvent.test.ts` under `lesson trace outputs`
4. Run `pnpm test` to verify the trace replays to the expected output

## Tests

`src/simulator/applyEvent.test.ts` — two suites:
- `applyEvent` — unit tests for individual event transitions
- `lesson trace outputs` — one test per lesson asserting `replayTrace(lesson.trace).output`

All 25 tests must stay green. Run `pnpm tsc --noEmit` after any type changes.

## Deployment

`vite.config.ts` sets `base: "/asyncio-aquarium/"` for GitHub Pages. Build with `pnpm build`; push `dist/` to the `gh-pages` branch (or use a GH Actions workflow).
