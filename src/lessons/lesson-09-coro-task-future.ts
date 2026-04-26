import type { Lesson } from "../simulator/types";

export const lesson09: Lesson = {
  id: "lesson-09-coro-task-future",
  title: "Lesson 9 — Coroutine vs Task vs Future",
  concept:
    "All three are awaitable, but they differ in who produces the value. A coroutine is paused code that runs when something awaits it. A task is a coroutine the loop drives on its own. A Future has no body at all — it just holds a value that something else sets via fut.set_result(...).",
  code: `import asyncio

async def value():
    return 42

async def resolve_later(fut):
    await asyncio.sleep(0)
    fut.set_result(99)   # resolves the Future from outside

async def main():
    coro = value()                          # coroutine — body has not run
    task = asyncio.create_task(value())     # task — scheduled to run
    fut = asyncio.Future()                  # future — empty placeholder

    asyncio.create_task(resolve_later(fut))

    print(await coro)   # await drives the coroutine's body
    print(await task)   # await waits for the task to finish
    print(await fut)    # await waits for set_result on the future

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
        "No. A Future has no body at all. Its value is set externally via fut.set_result(...).",
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
      line: 21,
    },
    { kind: "start_task", taskId: "main", line: 11 },
    {
      kind: "create_coroutine",
      coroutineId: "coro-value-1",
      label: "value()",
      line: 11,
      note: "value() returns a coroutine object. Body has not run.",
    },
    {
      kind: "create_coroutine",
      coroutineId: "coro-value-2",
      label: "value()",
      line: 12,
    },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "task",
      label: "value()",
      line: 12,
      note: "create_task hands the coroutine to the loop. It will run when main yields.",
    },
    {
      kind: "note",
      line: 13,
      text: "asyncio.Future() builds an empty placeholder. There is no body to run — its value will be set by someone else.",
    },
    {
      kind: "create_coroutine",
      coroutineId: "coro-resolver",
      label: "resolve_later(fut)",
      line: 15,
    },
    {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "resolver",
      label: "resolve_later(fut)",
      line: 15,
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "coro-value-1",
      yields: false,
      line: 17,
      note: "await drives the coroutine inline; it returns 42 without yielding to the loop.",
    },
    { kind: "print", taskId: "main", value: "42", line: 17 },
    {
      kind: "await",
      taskId: "main",
      targetId: "task",
      yields: true,
      line: 18,
      note: "task hasn't run yet. main suspends so the loop can run queued tasks.",
    },
    { kind: "start_task", taskId: "task", line: 4 },
    { kind: "complete", taskId: "task", result: "42", line: 4 },
    { kind: "wake", taskId: "main", line: 18 },
    { kind: "start_task", taskId: "resolver", line: 7 },
    {
      kind: "sleep",
      taskId: "resolver",
      duration: 0,
      line: 7,
      note: "resolver yields before resolving fut, so main reaches its await first.",
    },
    { kind: "start_task", taskId: "main", line: 18 },
    { kind: "print", taskId: "main", value: "42", line: 18 },
    {
      kind: "await",
      taskId: "main",
      targetId: "fut",
      yields: true,
      line: 19,
      note: "fut has no value yet. main suspends, waiting for set_result.",
    },
    { kind: "wake", taskId: "resolver", line: 7 },
    { kind: "start_task", taskId: "resolver", line: 8 },
    {
      kind: "note",
      line: 8,
      text: "fut.set_result(99) resolves the Future and wakes anyone awaiting it.",
    },
    { kind: "complete", taskId: "resolver", line: 8 },
    { kind: "wake", taskId: "main", line: 19 },
    { kind: "start_task", taskId: "main", line: 19 },
    { kind: "print", taskId: "main", value: "99", line: 19 },
    { kind: "complete", taskId: "main", line: 21 },
  ],
  explanation:
    "A Future is the loop's generic 'I'll have a value later' handle — and unlike a coroutine, there is no body to run. You don't write code 'inside' a Future; you create one and something else fulfils it by calling fut.set_result(...). That something can be another task, a callback from a network library, or a worker thread. (Internally, Task is a subclass of Future — which is why `await task` and `await fut` look identical at the call site.)",
};
