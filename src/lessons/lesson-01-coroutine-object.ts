import type { Lesson } from "../simulator/types";

export const lesson01: Lesson = {
  id: "lesson-01-coroutine-object",
  title: "Lesson 1 — Calling an async function does not run it",
  concept:
    "Calling an async function creates a coroutine object. The body does not run until something awaits it or schedules it as a task.",
  code: `async def hello():
    print("hello")

coro = hello()
print("done")`,
  question: "What gets printed?",
  choices: [
    {
      id: "a",
      text: "hello\\ndone",
      isCorrect: false,
      feedback:
        "No. The body of hello() never runs because the coroutine is never awaited or scheduled.",
    },
    {
      id: "b",
      text: "done",
      isCorrect: true,
      feedback:
        "Correct. hello() returns a coroutine object; without await or create_task the body never executes.",
    },
    {
      id: "c",
      text: "hello",
      isCorrect: false,
      feedback:
        "No. print(\"done\") is a normal sync call; it runs. The coroutine body is what does not run.",
    },
    {
      id: "d",
      text: "Nothing — calling an async function raises an error",
      isCorrect: false,
      feedback:
        "No. Calling an async function is legal — it just produces a coroutine object instead of running.",
    },
  ],
  trace: [
    {
      kind: "create_coroutine",
      coroutineId: "coro-hello",
      label: "hello()",
      note: "hello() returns a coroutine object. Body has not run.",
    },
    {
      kind: "print",
      taskId: "sync-main",
      value: "done",
      note: "Top-level print runs normally.",
    },
    {
      kind: "note",
      text: "The coroutine was created but never awaited or scheduled. Its body never executes.",
    },
  ],
  explanation:
    "An async def function is a factory for coroutine objects. Calling it builds the object but does not run its body. The body runs only when something drives it — either await, asyncio.run, or being wrapped in a Task.",
};
