import type { Lesson } from "../simulator/types";

export const lesson12: Lesson = {
  id: "lesson-12-task-group",
  title: "Lesson 12 — TaskGroup waits for all children",
  concept:
    "asyncio.TaskGroup is a structured-concurrency context manager. The 'async with' block does not exit until every task created inside it has finished.",
  code: `import asyncio

async def worker(name):
    print(name, "start")
    await asyncio.sleep(0)
    print(name, "end")

async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(worker("A"))
        tg.create_task(worker("B"))
    print("after group")

asyncio.run(main())`,
  question: "When does 'after group' print?",
  choices: [
    {
      id: "a",
      text: "Right after both create_task calls return.",
      isCorrect: false,
      feedback:
        "No. The async with block exits only when all child tasks have finished.",
    },
    {
      id: "b",
      text: "Between A's start and A's end.",
      isCorrect: false,
      feedback:
        "No. main is suspended at the end of the async with block until both workers complete.",
    },
    {
      id: "c",
      text: "After both workers have finished.",
      isCorrect: true,
      feedback:
        "Correct. Exiting the TaskGroup awaits every child. Only once A and B both end does main resume and print 'after group'.",
    },
    {
      id: "d",
      text: "Never — TaskGroup blocks main forever.",
      isCorrect: false,
      feedback:
        "No. The children complete; main resumes normally.",
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
    {
      kind: "start_task",
      taskId: "main",
      line: 9,
      note: "Entering the TaskGroup context.",
    },
    { kind: "create_coroutine", coroutineId: "coro-A", label: 'worker("A")', line: 10 },
    { kind: "create_task", parentTaskId: "main", taskId: "A", label: 'worker("A")', line: 10 },
    { kind: "create_coroutine", coroutineId: "coro-B", label: 'worker("B")', line: 11 },
    { kind: "create_task", parentTaskId: "main", taskId: "B", label: 'worker("B")', line: 11 },
    {
      kind: "await",
      taskId: "main",
      targetId: "task-group",
      yields: true,
      line: 9,
      note: "Reaching the end of the async with — TaskGroup waits for every child.",
    },
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
      note: "All children done. The async with exits.",
    },
    { kind: "start_task", taskId: "main", line: 12 },
    { kind: "print", taskId: "main", value: "after group", line: 12 },
    { kind: "complete", taskId: "main", line: 14 },
  ],
  explanation:
    "TaskGroup is the modern, structured form of gather. Two important properties: it always awaits every child before exiting, and if any child raises, every other child is cancelled and the exception (or an ExceptionGroup) is propagated. That's structured concurrency: child tasks cannot outlive the block that created them.",
};
