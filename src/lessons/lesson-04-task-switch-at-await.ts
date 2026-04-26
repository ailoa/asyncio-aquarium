import type { Lesson } from "../simulator/types";

export const lesson04: Lesson = {
  id: "lesson-04-task-switch-at-await",
  title: "Lesson 4 — Switching only happens at await",
  concept:
    "Between await points, a running task is never interrupted. Switching is cooperative.",
  code: `import asyncio

async def worker():
    print("A")
    await asyncio.sleep(0)
    print("B")

async def main():
    task = asyncio.create_task(worker())
    print("C")
    await task
    print("D")

asyncio.run(main())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "A\nB\nC\nD",
      isCorrect: false,
      feedback:
        "No. worker doesn't run yet — main keeps going until it awaits.",
    },
    {
      id: "b",
      text: "A\nC\nB\nD",
      isCorrect: false,
      feedback:
        "No. create_task does not preempt. main prints C before worker starts.",
    },
    {
      id: "c",
      text: "C\nA\nB\nD",
      isCorrect: true,
      feedback:
        "Correct. main prints C, then 'await task' yields. worker runs (A, then suspends at sleep(0), then B). main resumes and prints D.",
    },
    {
      id: "d",
      text: "C\nA\nD\nB",
      isCorrect: false,
      feedback:
        "No. main is awaiting task — it can't resume until task is done.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 14,
    },
    { kind: "start_task", taskId: "main", line: 9 },
    { kind: "create_coroutine", coroutineId: "coro-worker", label: "worker()", line: 9 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "worker",
      label: "worker()",
      line: 9,
    },
    { kind: "print", taskId: "main", value: "C", line: 10 },
    {
      kind: "await",
      taskId: "main",
      targetId: "worker",
      yields: true,
      line: 11,
      note: "main suspends until worker is done.",
    },
    { kind: "start_task", taskId: "worker", line: 4 },
    { kind: "print", taskId: "worker", value: "A", line: 4 },
    {
      kind: "sleep",
      taskId: "worker",
      duration: 0,
      line: 5,
      note: "sleep(0) yields. No other task is ready, so worker is rescheduled.",
    },
    { kind: "wake", taskId: "worker", line: 5 },
    { kind: "start_task", taskId: "worker", line: 6 },
    { kind: "print", taskId: "worker", value: "B", line: 6 },
    { kind: "complete", taskId: "worker", line: 6 },
    { kind: "wake", taskId: "main", line: 11, note: "worker is done; main is woken." },
    { kind: "start_task", taskId: "main", line: 12 },
    { kind: "print", taskId: "main", value: "D", line: 12 },
    { kind: "complete", taskId: "main", line: 14 },
  ],
  explanation:
    "A running task continues until it awaits something incomplete, returns, or raises. Notice how worker only starts when main awaits, and main only resumes when worker completes.",
};
