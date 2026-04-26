import type { Lesson } from "../simulator/types";

export const lesson10: Lesson = {
  id: "lesson-10-blocking-freezes-loop",
  title: "Lesson 10 — Blocking calls freeze the event loop",
  concept:
    "asyncio runs on a single thread. A synchronous blocking call (like time.sleep) holds that thread, so no other task can run until it returns.",
  code: `import asyncio
import time

async def ticker():
    print("tick 1")
    await asyncio.sleep(0)
    print("tick 2")

async def main():
    t = asyncio.create_task(ticker())
    print("blocking...")
    time.sleep(2)
    print("done")
    await t

asyncio.run(main())`,
  question: "When does ticker first print?",
  choices: [
    {
      id: "a",
      text: "Right after create_task — it starts running immediately.",
      isCorrect: false,
      feedback:
        "No. create_task only schedules the task; it doesn't preempt main.",
    },
    {
      id: "b",
      text: "Sometime during the time.sleep(2) — the loop runs other tasks while waiting.",
      isCorrect: false,
      feedback:
        "No. time.sleep is synchronous — it blocks the OS thread. The event loop has nothing to schedule on while it's blocked.",
    },
    {
      id: "c",
      text: "After 'done', once main hits await t.",
      isCorrect: true,
      feedback:
        "Correct. The loop is frozen for the full 2 seconds. ticker only runs once main yields at await t.",
    },
    {
      id: "d",
      text: "Never — ticker is starved.",
      isCorrect: false,
      feedback:
        "No. main yields at 'await t' and the loop then runs ticker.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 16,
    },
    { kind: "start_task", taskId: "main", line: 10 },
    { kind: "create_coroutine", coroutineId: "coro-ticker", label: "ticker()", line: 10 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "ticker",
      label: "ticker()",
      line: 10,
    },
    { kind: "print", taskId: "main", value: "blocking...", line: 11 },
    {
      kind: "note",
      line: 12,
      text: "time.sleep(2) blocks the OS thread. The event loop cannot run any other task during this window.",
    },
    {
      kind: "time_advance",
      to: 2,
      note: "Two real seconds pass with the loop frozen. ticker is ready but cannot be scheduled.",
    },
    { kind: "print", taskId: "main", value: "done", line: 13 },
    {
      kind: "await",
      taskId: "main",
      targetId: "ticker",
      yields: true,
      line: 14,
      note: "main finally yields. The loop can now run ticker.",
    },
    { kind: "start_task", taskId: "ticker", line: 4 },
    { kind: "print", taskId: "ticker", value: "tick 1", line: 5 },
    { kind: "sleep", taskId: "ticker", duration: 0, line: 6 },
    { kind: "wake", taskId: "ticker", line: 6 },
    { kind: "start_task", taskId: "ticker", line: 7 },
    { kind: "print", taskId: "ticker", value: "tick 2", line: 7 },
    { kind: "complete", taskId: "ticker", line: 7 },
    { kind: "wake", taskId: "main", line: 14 },
    { kind: "start_task", taskId: "main", line: 14 },
    { kind: "complete", taskId: "main", line: 16 },
  ],
  explanation:
    "Anything that blocks the OS thread blocks the loop: time.sleep, requests.get, big synchronous loops, file I/O without an async wrapper. The fix is to use the async equivalent (asyncio.sleep, an async HTTP client) or push the blocking work to a thread with asyncio.to_thread. If you remember one rule: don't block.",
};
