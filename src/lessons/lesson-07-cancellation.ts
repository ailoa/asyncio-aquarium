import type { Lesson } from "../simulator/types";

export const lesson07: Lesson = {
  id: "lesson-07-cancellation",
  title: "Lesson 7 — Cancellation is delivered at await points",
  concept:
    "task.cancel() schedules a CancelledError to be raised the next time the task resumes from a suspension point.",
  code: `import asyncio

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

asyncio.run(main())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "start\\nend",
      isCorrect: false,
      feedback:
        "No. task.cancel() interrupts the sleep — 'end' is never reached.",
    },
    {
      id: "b",
      text: "start\\ncancelled\\nmain saw cancellation",
      isCorrect: true,
      feedback:
        "Correct. CancelledError is raised inside sleep(10), the except handler prints 'cancelled' and re-raises, and main's await sees it.",
    },
    {
      id: "c",
      text: "start\\ncancelled",
      isCorrect: false,
      feedback:
        "No. worker re-raises CancelledError, so main's except branch also runs.",
    },
    {
      id: "d",
      text: "cancelled\\nmain saw cancellation",
      isCorrect: false,
      feedback:
        "No. worker reaches print('start') before cancel is scheduled.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 21,
    },
    { kind: "start_task", taskId: "main", line: 13 },
    { kind: "create_coroutine", coroutineId: "coro-worker", label: "worker()", line: 13 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "worker",
      label: "worker()",
      line: 13,
    },
    { kind: "sleep", taskId: "main", duration: 0, line: 14 },
    { kind: "wake", taskId: "main", line: 14 },
    { kind: "start_task", taskId: "worker", line: 5 },
    { kind: "print", taskId: "worker", value: "start", line: 5 },
    {
      kind: "sleep",
      taskId: "worker",
      duration: 10,
      line: 6,
      note: "worker suspends at sleep(10).",
    },
    { kind: "start_task", taskId: "main", line: 15 },
    {
      kind: "note",
      line: 15,
      text: "task.cancel() arms a CancelledError to be raised at worker's next resume point.",
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "worker",
      yields: true,
      line: 17,
      note: "main awaits worker; the loop now resumes worker with CancelledError.",
    },
    {
      kind: "wake",
      taskId: "worker",
      line: 6,
      note: "worker wakes — but with CancelledError instead of normal return.",
    },
    { kind: "start_task", taskId: "worker", line: 8 },
    { kind: "print", taskId: "worker", value: "cancelled", line: 9 },
    {
      kind: "cancel",
      taskId: "worker",
      line: 10,
      note: "raise re-throws CancelledError; the task ends in cancelled state.",
    },
    { kind: "wake", taskId: "main", line: 17 },
    { kind: "start_task", taskId: "main", line: 18 },
    { kind: "print", taskId: "main", value: "main saw cancellation", line: 19 },
    { kind: "complete", taskId: "main", line: 21 },
  ],
  explanation:
    "Cancellation is not preemptive — it's an exception scheduled to fire at the task's next await boundary. A task can catch CancelledError to clean up, but if it doesn't re-raise, the task is treated as having handled the cancellation. Awaiters see CancelledError propagate when the task ends in a cancelled state.",
};
