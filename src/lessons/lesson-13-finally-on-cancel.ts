import type { Lesson } from "../simulator/types";

export const lesson13: Lesson = {
  id: "lesson-13-finally-on-cancel",
  title: "Lesson 13 — finally runs on cancellation",
  concept:
    "When a task is cancelled, CancelledError is injected at the current await point. The try block exits and the finally block runs before the task ends — making finally reliable for cleanup.",
  code: `import asyncio

async def worker():
    try:
        print("working")
        await asyncio.sleep(10)
        print("done")
    finally:
        print("cleanup")

async def main():
    task = asyncio.create_task(worker())
    await asyncio.sleep(0)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

asyncio.run(main())`,
  question: "What gets printed?",
  choices: [
    {
      id: "a",
      text: "working\ndone\ncleanup",
      isCorrect: false,
      feedback:
        "No. task.cancel() interrupts the sleep — 'done' is never reached.",
    },
    {
      id: "b",
      text: "working\ncleanup",
      isCorrect: true,
      feedback:
        "Correct. CancelledError is raised at sleep(10). The try block exits without reaching 'done', but finally always runs before the task ends.",
    },
    {
      id: "c",
      text: "working",
      isCorrect: false,
      feedback:
        "No. finally is guaranteed to run even on cancellation — that's the whole point of finally.",
    },
    {
      id: "d",
      text: "cleanup",
      isCorrect: false,
      feedback:
        "No. 'working' prints before worker ever reaches the sleep.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 20,
    },
    { kind: "start_task", taskId: "main", line: 12 },
    { kind: "create_coroutine", coroutineId: "coro-worker", label: "worker()", line: 12 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "worker",
      label: "worker()",
      line: 12,
    },
    { kind: "sleep", taskId: "main", duration: 0, line: 13 },
    { kind: "wake", taskId: "main", line: 13 },
    { kind: "start_task", taskId: "worker", line: 5 },
    { kind: "print", taskId: "worker", value: "working", line: 5 },
    {
      kind: "sleep",
      taskId: "worker",
      duration: 10,
      line: 6,
      note: "worker suspends at sleep(10).",
    },
    { kind: "start_task", taskId: "main", line: 14 },
    {
      kind: "note",
      line: 14,
      text: "task.cancel() schedules CancelledError to be raised when worker next resumes.",
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "worker",
      yields: true,
      line: 16,
    },
    {
      kind: "wake",
      taskId: "worker",
      line: 6,
      note: "worker wakes with CancelledError injected. The try block exits immediately.",
    },
    {
      kind: "start_task",
      taskId: "worker",
      line: 8,
      note: "Execution jumps to the finally block.",
    },
    { kind: "print", taskId: "worker", value: "cleanup", line: 9 },
    {
      kind: "cancel",
      taskId: "worker",
      line: 9,
      note: "CancelledError propagates out of finally. Task ends as cancelled.",
    },
    { kind: "wake", taskId: "main", line: 16 },
    { kind: "start_task", taskId: "main", line: 17 },
    { kind: "complete", taskId: "main", line: 20 },
  ],
  explanation:
    "Python's finally is unconditional — it runs whether the try block ends normally, raises an exception, or is interrupted by CancelledError. This is what makes the pattern of putting cleanup (closing connections, flushing buffers, recording usage) in finally reliable in async code. One caveat: if the finally block itself contains an await, that await can also be cancelled. Keep finally blocks short and non-blocking where possible.",
};
