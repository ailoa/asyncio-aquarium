import type { Lesson } from "../simulator/types";

export const lesson03: Lesson = {
  id: "lesson-03-create-task-schedules",
  title: "Lesson 3 — create_task schedules but does not preempt",
  concept:
    "create_task wraps a coroutine in a Task and adds it to the ready queue. The current task keeps running until it yields.",
  code: `import asyncio

async def worker():
    print("worker")

async def main():
    asyncio.create_task(worker())
    print("main")
    await asyncio.sleep(0)

asyncio.run(main())`,
  question: "What gets printed?",
  choices: [
    {
      id: "a",
      text: "worker\\nmain",
      isCorrect: false,
      feedback:
        "No. create_task schedules worker but does not preempt main. main keeps running until sleep(0) yields.",
    },
    {
      id: "b",
      text: "main\\nworker",
      isCorrect: true,
      feedback:
        "Correct. main keeps running, prints 'main', then sleep(0) yields and worker finally gets to run.",
    },
    {
      id: "c",
      text: "main only — worker is never reached",
      isCorrect: false,
      feedback:
        "No. sleep(0) is a yield point; once main yields, the loop runs the ready worker task.",
    },
    {
      id: "d",
      text: "worker only",
      isCorrect: false,
      feedback:
        "No. main is the running task; it prints first.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 11,
      note: "asyncio.run wraps main() as a task.",
    },
    { kind: "start_task", taskId: "main", line: 7 },
    {
      kind: "create_coroutine",
      coroutineId: "coro-worker",
      label: "worker()",
      line: 7,
    },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "worker",
      label: "worker()",
      line: 7,
      note: "worker is queued. main keeps running.",
    },
    { kind: "print", taskId: "main", value: "main", line: 8 },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0,
      line: 9,
      note: "sleep(0) is a deliberate yield. Loop now picks the next ready task.",
    },
    { kind: "wake", taskId: "main", line: 9 },
    { kind: "start_task", taskId: "worker", line: 4 },
    { kind: "print", taskId: "worker", value: "worker", line: 4 },
    { kind: "complete", taskId: "worker", line: 4 },
    { kind: "start_task", taskId: "main", line: 9 },
    { kind: "complete", taskId: "main", line: 11 },
  ],
  explanation:
    "create_task does not run the coroutine immediately — it schedules it. The current task continues until it hits an await that yields. sleep(0) is the canonical zero-duration yield: it gives the loop a chance to run other ready tasks before resuming.",
};
