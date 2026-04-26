# Asyncio Aquarium — Debugger redesign port

Drop-in files that port the **Debugger** redesign direction into the existing repo.
File paths mirror the real project structure — copy them straight in.

## What's in this folder

```
port/src/
  styles/
    globals.css                 # replaces existing globals.css
  components/
    Sidebar.tsx                 # NEW — lesson nav with progress dots
    Header.tsx                  # NEW — top bar + theme toggle
    WhyCard.tsx                 # NEW — explanation card
    CodePanel.tsx               # replaces existing — file chrome, synced gutter, accent-soft active line
    AquariumView.tsx            # replaces existing — runtime rail with status-colored task chips
    Controls.tsx                # replaces existing — adds scrubber + last-event card
    OutputPanel.tsx             # replaces existing — pulls prints from timeline; shows taskId
    Timeline.tsx                # replaces existing — clickable rows + glyph icons
    PredictionPanel.tsx         # replaces existing — richer feedback states
  App.tsx                       # replaces existing — three-column layout with theme + keyboard shortcuts
```

## How to apply

```bash
# from the repo root:
cp -r ../async-aquarium-redesign/port/src/* src/
```

(Or just drag the contents of `port/src/` over your `src/` folder.)

No new dependencies are required. The existing `prismjs`, `react`, and `vitest` setup is reused.

## Notable changes

- **Layout**: three-column (`240px / 1fr / 360px`) — sidebar nav, main code-first column, right rail with prediction + Why.
- **Theme**: `:root` CSS variables drive both schemes; toggle stored on `<html data-theme="light">`. Default is dark.
- **Code panel**: window-chrome header (filename + active line + step counter), synced gutter arrow with pulse on active line.
- **Runtime view**: horizontal rail of four zones; each task is a status-colored pill with a CSS animation on enter and a soft glow when running.
- **Controls**: back / step / reset + a scrubber + a "last event" pill that summarizes the most recent transition.
- **Timeline**: each event is a clickable row that jumps the trace; past events are bright, future events are dimmed.
- **Prediction**: outlined choice cards; on submit, the selected choice tints green/red and shows feedback inline. Below it a one-line verdict ("Correct." / "Not quite.") echoes the result.
- **Why card**: subtle accent gradient. Always visible — students can re-read after stepping.
- **Sidebar progress**: a lesson is marked complete when the user steps to the end of its trace. Stored in component state for now; promote to `localStorage` if you want persistence.
- **Keyboard**: `←` / `→` step through the trace from anywhere on the page.

## Things to consider next

- Persist `completed` and `theme` to `localStorage`.
- Animate task chips between zones on step (FLIP or `view-transitions`); right now they fade in on enter only.
- Add a "play" button next to the scrubber for hands-free demos.
- Replace the `Sidebar` lesson title regex with structured `{number, title}` fields on the `Lesson` type for cleaner display.
