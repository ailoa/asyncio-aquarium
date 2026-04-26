import type { Lesson } from "../simulator/types";

export const lesson05: Lesson = {
  id: "lesson-05-sleep-time-order",
  title: "Lesson 5 — Sleeping tasks wake in time order",
  concept:
    "When multiple tasks are sleeping, the loop wakes them in order of their wake time, not the order they started sleeping.",
  code: `import asyncio

async def worker(name, delay):
    print(name, "start")
    await asyncio.sleep(delay)
    print(name, "end")

async def main():
    t1 = asyncio.create_task(worker("A", 2))
    t2 = asyncio.create_task(worker("B", 1))
    await t1
    await t2

asyncio.run(main())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "A start\\nA end\\nB start\\nB end",
      isCorrect: false,
      feedback:
        "No. Both workers reach their sleep before either wakes. They overlap.",
    },
    {
      id: "b",
      text: "A start\\nB start\\nA end\\nB end",
      isCorrect: false,
      feedback:
        "No. B sleeps for less time, so B wakes first.",
    },
    {
      id: "c",
      text: "A start\\nB start\\nB end\\nA end",
      isCorrect: true,
      feedback:
        "Correct. Both workers print 'start' and go to sleep. B's wake time (1) comes before A's (2), so B ends first.",
    },
    {
      id: "d",
      text: "B start\\nA start\\nB end\\nA end",
      isCorrect: false,
      feedback:
        "No. A was created first, so A enters the ready queue first and prints 'A start' first.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 15,
    },
    { kind: "start_task", taskId: "main", line: 9 },
    { kind: "create_coroutine", coroutineId: "coro-A", label: 'worker("A", 2)', line: 9 },
    { kind: "create_task", parentTaskId: "main", taskId: "A", label: 'worker("A", 2)', line: 9 },
    { kind: "create_coroutine", coroutineId: "coro-B", label: 'worker("B", 1)', line: 10 },
    { kind: "create_task", parentTaskId: "main", taskId: "B", label: 'worker("B", 1)', line: 10 },
    {
      kind: "await",
      taskId: "main",
      targetId: "A",
      yields: true,
      line: 11,
      note: "main suspends; loop runs the next ready task.",
    },
    { kind: "start_task", taskId: "A", line: 4 },
    { kind: "print", taskId: "A", value: "A start", line: 4 },
    { kind: "sleep", taskId: "A", duration: 2, line: 5, note: "A will wake at t=2." },
    { kind: "start_task", taskId: "B", line: 4 },
    { kind: "print", taskId: "B", value: "B start", line: 4 },
    { kind: "sleep", taskId: "B", duration: 1, line: 5, note: "B will wake at t=1." },
    {
      kind: "time_advance",
      to: 1,
      note: "Nothing is ready. The loop blocks until the earliest sleeper's timer fires (t=1).",
    },
    { kind: "wake", taskId: "B", line: 5 },
    { kind: "start_task", taskId: "B", line: 6 },
    { kind: "print", taskId: "B", value: "B end", line: 6 },
    { kind: "complete", taskId: "B", line: 6 },
    { kind: "time_advance", to: 2 },
    { kind: "wake", taskId: "A", line: 5 },
    { kind: "start_task", taskId: "A", line: 6 },
    { kind: "print", taskId: "A", value: "A end", line: 6 },
    { kind: "complete", taskId: "A", line: 6 },
    { kind: "wake", taskId: "main", line: 11 },
    { kind: "start_task", taskId: "main", line: 12 },
    {
      kind: "await",
      taskId: "main",
      targetId: "B",
      yields: false,
      line: 12,
      note: "B is already done. await returns immediately without yielding.",
    },
    { kind: "complete", taskId: "main", line: 15 },
  ],
  explanation:
    "Sleeping tasks live in a timer-ordered queue. The loop wakes whichever has the earliest deadline, regardless of arrival order. Awaiting an already-completed task does not yield — control stays with the awaiter.",
};
