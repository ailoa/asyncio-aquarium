import type { Lesson } from "../simulator/types";

export const lesson09: Lesson = {
  id: "lesson-09-coro-task-future",
  title: "Lesson 9 — Coroutine vs Task vs Future",
  concept:
    "All three are awaitable, but they differ in who runs them. A coroutine runs only when awaited. A task is a coroutine the loop drives on its own. A Future is a placeholder; something else must resolve it.",
  code: `import asyncio

async def value():
    return 42

async def resolve_later(fut):
    fut.set_result(99)

async def main():
    coro = value()
    task = asyncio.create_task(value())
    fut = asyncio.Future()

    asyncio.create_task(resolve_later(fut))

    print(await coro)
    print(await task)
    print(await fut)

asyncio.run(main())`,
  question: "Which of the three runs without anyone awaiting it?",
  choices: [
    {
      id: "a",
      text: "the coroutine",
      isCorrect: false,
      feedback:
        "No. A coroutine object is inert — its body runs only when something awaits it.",
    },
    {
      id: "b",
      text: "the task",
      isCorrect: true,
      feedback:
        "Correct. create_task hands the coroutine to the loop, which runs it as soon as it yields. Nobody has to await it.",
    },
    {
      id: "c",
      text: "the future",
      isCorrect: false,
      feedback:
        "No. A Future has no body. Its value is set externally via fut.set_result(...).",
    },
    {
      id: "d",
      text: "all three",
      isCorrect: false,
      feedback:
        "No — only the task runs on its own.",
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
    { kind: "start_task", taskId: "main", line: 10 },
    {
      kind: "create_coroutine",
      coroutineId: "coro-value-1",
      label: "value()",
      line: 10,
      note: "value() built a coroutine object. Body has not run.",
    },
    {
      kind: "create_coroutine",
      coroutineId: "coro-value-2",
      label: "value()",
      line: 11,
    },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "task",
      label: "value()",
      line: 11,
      note: "create_task scheduled the coroutine. It will run at the next yield.",
    },
    {
      kind: "note",
      line: 12,
      text: "asyncio.Future() builds an empty placeholder. No body runs to produce its result.",
    },
    {
      kind: "create_coroutine",
      coroutineId: "coro-resolver",
      label: "resolve_later(fut)",
      line: 14,
    },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "resolver",
      label: "resolve_later(fut)",
      line: 14,
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "coro-value-1",
      yields: false,
      line: 16,
      note: "Awaiting a coroutine drives its body inline — no yield.",
    },
    { kind: "print", taskId: "main", value: "42", line: 16 },
    {
      kind: "await",
      taskId: "main",
      targetId: "task",
      yields: true,
      line: 17,
      note: "task hasn't run yet. main suspends; the loop runs queued tasks.",
    },
    { kind: "start_task", taskId: "task", line: 4 },
    { kind: "complete", taskId: "task", result: "42", line: 4 },
    { kind: "wake", taskId: "main", line: 17 },
    { kind: "start_task", taskId: "resolver", line: 7 },
    {
      kind: "note",
      line: 7,
      text: "fut.set_result(99) resolves the Future before main even awaits it.",
    },
    { kind: "complete", taskId: "resolver", line: 7 },
    { kind: "start_task", taskId: "main", line: 17 },
    { kind: "print", taskId: "main", value: "42", line: 17 },
    {
      kind: "await",
      taskId: "main",
      targetId: "fut",
      yields: false,
      line: 18,
      note: "fut is already resolved. Awaiting an already-done Future returns immediately.",
    },
    { kind: "print", taskId: "main", value: "99", line: 18 },
    { kind: "complete", taskId: "main", line: 20 },
  ],
  explanation:
    "A coroutine is a paused computation waiting for a driver. A task is a coroutine the event loop has agreed to drive. A Future is the loop's general 'I'll have a value later' handle — useful when the value comes from outside (a callback, another thread, a network event). Only tasks run autonomously.",
};
