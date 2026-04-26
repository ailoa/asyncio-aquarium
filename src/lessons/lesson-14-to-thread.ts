import type { Lesson } from "../simulator/types";

export const lesson14: Lesson = {
  id: "lesson-14-to-thread",
  title: "Lesson 14 — asyncio.to_thread for blocking work",
  concept:
    "asyncio.to_thread() runs a blocking function in a separate OS thread and returns an awaitable. The event loop stays free to run other tasks while the thread works.",
  code: `import asyncio
import time

def blocking_work():
    time.sleep(1)
    return "result"

async def ticker():
    for i in range(3):
        print("tick", i)
        await asyncio.sleep(0)

async def main():
    asyncio.create_task(ticker())
    result = await asyncio.to_thread(blocking_work)
    print(result)

asyncio.run(main())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "result\ntick 0\ntick 1\ntick 2",
      isCorrect: false,
      feedback:
        "No. main suspends at to_thread, so ticker runs first.",
    },
    {
      id: "b",
      text: "tick 0\ntick 1\ntick 2\nresult",
      isCorrect: true,
      feedback:
        "Correct. to_thread offloads blocking_work to a thread and yields. The loop is free to run ticker while the thread works. main resumes only after blocking_work returns.",
    },
    {
      id: "c",
      text: "blocking...\ntick 0\ntick 1\ntick 2\nresult",
      isCorrect: false,
      feedback:
        "blocking_work has no print statement — it just sleeps and returns.",
    },
    {
      id: "d",
      text: "tick 0\nresult\ntick 1\ntick 2",
      isCorrect: false,
      feedback:
        "No. blocking_work finishes after ticker is done (ticker uses sleep(0), blocking_work uses 1 second).",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 18,
    },
    { kind: "start_task", taskId: "main", line: 14 },
    { kind: "create_coroutine", coroutineId: "coro-ticker", label: "ticker()", line: 14 },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "ticker",
      label: "ticker()",
      line: 14,
    },
    {
      kind: "note",
      line: 15,
      text: "to_thread(blocking_work) starts blocking_work in an OS thread and returns an awaitable.",
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "to_thread",
      yields: true,
      line: 15,
      note: "main suspends. The loop is free while the thread runs in the background.",
    },
    { kind: "start_task", taskId: "ticker", line: 10 },
    { kind: "print", taskId: "ticker", value: "tick 0", line: 10 },
    { kind: "sleep", taskId: "ticker", duration: 0, line: 11 },
    { kind: "wake", taskId: "ticker", line: 11 },
    { kind: "start_task", taskId: "ticker", line: 10 },
    { kind: "print", taskId: "ticker", value: "tick 1", line: 10 },
    { kind: "sleep", taskId: "ticker", duration: 0, line: 11 },
    { kind: "wake", taskId: "ticker", line: 11 },
    { kind: "start_task", taskId: "ticker", line: 10 },
    { kind: "print", taskId: "ticker", value: "tick 2", line: 10 },
    { kind: "sleep", taskId: "ticker", duration: 0, line: 11 },
    { kind: "complete", taskId: "ticker", line: 11 },
    {
      kind: "wake",
      taskId: "main",
      line: 15,
      note: "blocking_work finished in its thread. main is woken with the return value.",
    },
    { kind: "start_task", taskId: "main", line: 16 },
    { kind: "print", taskId: "main", value: "result", line: 16 },
    { kind: "complete", taskId: "main", line: 18 },
  ],
  explanation:
    "to_thread is the right fix for sync-in-async: database queries, file I/O, CPU-bound work, anything that blocks the OS thread. It doesn't make blocking_work faster — it just runs it off the main thread so the loop can keep scheduling other tasks. The awaitable it returns resolves once the thread finishes. Thread safety is your responsibility: don't share mutable async state with the thread.",
};
