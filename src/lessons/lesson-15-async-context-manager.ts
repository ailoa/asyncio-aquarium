import type { Lesson } from "../simulator/types";

export const lesson15: Lesson = {
  id: "lesson-15-async-context-manager",
  title: "Lesson 15 — async context managers",
  concept:
    "async with calls __aenter__ on entry and __aexit__ on exit. Both are coroutines, so the setup and teardown can themselves await — useful for opening connections, acquiring locks, or flushing buffers.",
  code: `import asyncio

class Connection:
    async def __aenter__(self):
        print("open")
        await asyncio.sleep(0)
        return self

    async def __aexit__(self, *args):
        print("close")
        await asyncio.sleep(0)

async def main():
    async with Connection() as conn:
        print("using")

asyncio.run(main())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "using",
      isCorrect: false,
      feedback:
        "No. __aenter__ runs before the block body and __aexit__ runs after.",
    },
    {
      id: "b",
      text: "open\nusing\nclose",
      isCorrect: true,
      feedback:
        "Correct. async with awaits __aenter__ (which prints 'open'), runs the block body, then awaits __aexit__ (which prints 'close') — even if the block raises.",
    },
    {
      id: "c",
      text: "open\nclose\nusing",
      isCorrect: false,
      feedback:
        "No. __aexit__ runs after the block body, not before.",
    },
    {
      id: "d",
      text: "open\nusing",
      isCorrect: false,
      feedback:
        "No. __aexit__ always runs when the block exits — that's the guarantee async with provides.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 17,
    },
    { kind: "start_task", taskId: "main", line: 14 },
    {
      kind: "note",
      line: 14,
      text: "async with calls Connection().__aenter__() and awaits it.",
    },
    { kind: "print", taskId: "main", value: "open", line: 5 },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0,
      line: 6,
      note: "__aenter__ itself can yield — useful for async setup like opening a socket.",
    },
    { kind: "wake", taskId: "main", line: 6 },
    { kind: "start_task", taskId: "main", line: 7, note: "__aenter__ returns self as conn." },
    { kind: "print", taskId: "main", value: "using", line: 15 },
    {
      kind: "note",
      line: 14,
      text: "Block body finished. async with now calls __aexit__() and awaits it.",
    },
    { kind: "print", taskId: "main", value: "close", line: 10 },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0,
      line: 11,
      note: "__aexit__ can also yield — for flushing buffers, releasing locks, etc.",
    },
    { kind: "wake", taskId: "main", line: 11 },
    { kind: "start_task", taskId: "main", line: 14 },
    { kind: "complete", taskId: "main", line: 17 },
  ],
  explanation:
    "async with is to async def what with is to def — a protocol for guaranteed setup and teardown. __aenter__ receives the result of await, __aexit__ runs even on exception or cancellation. Libraries like aiohttp, asyncpg, and asyncio.Lock all implement this protocol. The regular 'with' statement calls __enter__/__exit__ synchronously; if you need to await during setup or teardown, you need async with.",
};
