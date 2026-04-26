import type { Lesson } from "../simulator/types";

export const lesson06: Lesson = {
  id: "lesson-06-gather",
  title: "Lesson 6 — gather schedules many, awaits all",
  concept:
    "asyncio.gather schedules each awaitable as a task and resumes the caller when all of them have finished.",
  code: `import asyncio

async def worker(name):
    print(name, "start")
    await asyncio.sleep(0)
    print(name, "end")

async def main():
    await asyncio.gather(worker("A"), worker("B"))
    print("done")

asyncio.run(main())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "A start\\nA end\\nB start\\nB end\\ndone",
      isCorrect: false,
      feedback:
        "No. Both workers reach their sleep(0) before either resumes. They interleave.",
    },
    {
      id: "b",
      text: "A start\\nB start\\nA end\\nB end\\ndone",
      isCorrect: true,
      feedback:
        "Correct. Both workers run up to sleep(0), then both resume in scheduling order. main prints 'done' once both are complete.",
    },
    {
      id: "c",
      text: "done\\nA start\\nB start\\nA end\\nB end",
      isCorrect: false,
      feedback:
        "No. main is awaiting gather; it can't print 'done' until both workers finish.",
    },
    {
      id: "d",
      text: "A start\\nB start\\ndone",
      isCorrect: false,
      feedback:
        "No. Each worker still has its second print after the sleep.",
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
    { kind: "start_task", taskId: "main", line: 9 },
    { kind: "create_coroutine", coroutineId: "coro-A", label: 'worker("A")', line: 9 },
    { kind: "create_coroutine", coroutineId: "coro-B", label: 'worker("B")', line: 9 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "A",
      label: 'worker("A")',
      line: 9,
      note: "gather wraps each awaitable as a task.",
    },
    { kind: "create_task", parentTaskId: "main", taskId: "B", label: 'worker("B")', line: 9 },
    { kind: "await", taskId: "main", targetId: "gather", yields: true, line: 9 },
    { kind: "start_task", taskId: "A", line: 4 },
    { kind: "print", taskId: "A", value: "A start", line: 4 },
    { kind: "sleep", taskId: "A", duration: 0, line: 5 },
    { kind: "start_task", taskId: "B", line: 4 },
    { kind: "print", taskId: "B", value: "B start", line: 4 },
    { kind: "sleep", taskId: "B", duration: 0, line: 5 },
    { kind: "wake", taskId: "A", line: 5 },
    { kind: "start_task", taskId: "A", line: 6 },
    { kind: "print", taskId: "A", value: "A end", line: 6 },
    { kind: "complete", taskId: "A", line: 6 },
    { kind: "wake", taskId: "B", line: 5 },
    { kind: "start_task", taskId: "B", line: 6 },
    { kind: "print", taskId: "B", value: "B end", line: 6 },
    { kind: "complete", taskId: "B", line: 6 },
    {
      kind: "wake",
      taskId: "main",
      line: 9,
      note: "All gathered tasks are done. main is woken.",
    },
    { kind: "start_task", taskId: "main", line: 10 },
    { kind: "print", taskId: "main", value: "done", line: 10 },
    { kind: "complete", taskId: "main", line: 13 },
  ],
  explanation:
    "gather is a fan-out/fan-in primitive: it ensures every awaitable runs as a task and only returns once they've all completed. The interleaving here comes from the same cooperative rule as before — each worker yields at sleep(0).",
};
