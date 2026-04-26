import type { Lesson } from "../simulator/types";

export const lesson11: Lesson = {
  id: "lesson-11-async-for",
  title: "Lesson 11 — async generators and async for",
  concept:
    "An async generator suspends at every await inside it; async for awaits the next value on each iteration. Each value is delivered through a real yield point.",
  code: `import asyncio

async def numbers():
    for i in range(1, 4):
        await asyncio.sleep(0)
        yield i

async def main():
    async for n in numbers():
        print(n)

asyncio.run(main())`,
  question: "What gets printed?",
  choices: [
    {
      id: "a",
      text: "Nothing — async generators need explicit await calls",
      isCorrect: false,
      feedback:
        "No. async for is exactly that — it awaits the next value on each iteration.",
    },
    {
      id: "b",
      text: "1\n2\n3",
      isCorrect: true,
      feedback:
        "Correct. async for drives the generator's __anext__ on each iteration, each one suspending main at the inner sleep(0) before the next value is delivered.",
    },
    {
      id: "c",
      text: "1 — generators only run their body once",
      isCorrect: false,
      feedback:
        "No. Each iteration of async for resumes the generator from where it last yielded.",
    },
    {
      id: "d",
      text: "An error — async generators require 'yield from'",
      isCorrect: false,
      feedback:
        "No. yield from is for normal generators. async generators use plain yield inside async def.",
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
    {
      kind: "create_coroutine",
      coroutineId: "gen-numbers",
      label: "numbers()",
      line: 9,
      note: "numbers() builds an async generator. Body has not run yet.",
    },
    {
      kind: "note",
      line: 9,
      text: "async for asks the generator for its next value. The generator runs until it yields or returns.",
    },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0,
      line: 5,
      note: "Generator awaits sleep(0) — main suspends.",
    },
    { kind: "wake", taskId: "main", line: 5 },
    { kind: "start_task", taskId: "main", line: 6 },
    {
      kind: "print",
      taskId: "main",
      value: "1",
      line: 10,
      note: "Generator yielded 1; async for delivers it to n.",
    },
    { kind: "sleep", taskId: "main", duration: 0, line: 5 },
    { kind: "wake", taskId: "main", line: 5 },
    { kind: "start_task", taskId: "main", line: 6 },
    { kind: "print", taskId: "main", value: "2", line: 10 },
    { kind: "sleep", taskId: "main", duration: 0, line: 5 },
    { kind: "wake", taskId: "main", line: 5 },
    { kind: "start_task", taskId: "main", line: 6 },
    { kind: "print", taskId: "main", value: "3", line: 10 },
    {
      kind: "note",
      line: 4,
      text: "Range is exhausted; numbers raises StopAsyncIteration; async for exits.",
    },
    { kind: "complete", taskId: "main", line: 13 },
  ],
  explanation:
    "An async generator is a coroutine that yields. Each yield suspends the generator and hands one value to whoever is iterating it. Each await inside the body is a real yield to the loop, just like in any other coroutine — so `async for` is itself a sequence of awaits.",
};
