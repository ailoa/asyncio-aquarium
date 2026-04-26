import type { Lesson } from "../simulator/types";

export const lesson08: Lesson = {
  id: "lesson-08-timeout",
  title: "Lesson 8 — Timeout cancels a slow awaitable",
  concept:
    "wait_for runs an awaitable with a deadline. If the deadline passes first, it cancels the inner task and raises TimeoutError.",
  code: `import asyncio

async def slow():
    await asyncio.sleep(10)
    return "done"

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=1)
    except asyncio.TimeoutError:
        print("timeout")

asyncio.run(main())`,
  question: "What gets printed?",
  choices: [
    {
      id: "a",
      text: "done",
      isCorrect: false,
      feedback:
        "No. slow() needs 10 units; the timeout fires at 1.",
    },
    {
      id: "b",
      text: "timeout",
      isCorrect: true,
      feedback:
        "Correct. The 1-unit timer fires before slow finishes; wait_for cancels slow and raises TimeoutError, which main catches.",
    },
    {
      id: "c",
      text: "Nothing — TimeoutError is unhandled",
      isCorrect: false,
      feedback:
        "No. main has an except clause for TimeoutError.",
    },
    {
      id: "d",
      text: "timeout\\ndone",
      isCorrect: false,
      feedback:
        "No. slow is cancelled before it can return; 'done' is never produced.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 13,
    },
    { kind: "start_task", taskId: "main", line: 8 },
    { kind: "create_coroutine", coroutineId: "coro-slow", label: "slow()", line: 9 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "slow",
      label: "slow()",
      line: 9,
      note: "wait_for wraps slow() as a task with a 1-unit deadline.",
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "slow",
      yields: true,
      line: 9,
    },
    { kind: "start_task", taskId: "slow", line: 4 },
    {
      kind: "sleep",
      taskId: "slow",
      duration: 10,
      line: 4,
      note: "slow will not finish until t=10.",
    },
    {
      kind: "time_advance",
      to: 1,
      note: "Loop blocks waiting for timers. wait_for's 1-unit timer fires before slow's sleep(10).",
    },
    {
      kind: "cancel",
      taskId: "slow",
      line: 4,
      note: "wait_for cancels the inner task.",
    },
    {
      kind: "wake",
      taskId: "main",
      line: 9,
      note: "wait_for raises TimeoutError into main.",
    },
    { kind: "start_task", taskId: "main", line: 10 },
    { kind: "print", taskId: "main", value: "timeout", line: 11 },
    { kind: "complete", taskId: "main", line: 13 },
  ],
  explanation:
    "wait_for is a scheduled cancellation: it starts the inner awaitable, also starts a timer, and races them. Whichever finishes first wins. If the timer wins, wait_for cancels the inner task and re-raises as TimeoutError so the caller can decide how to react.",
};
