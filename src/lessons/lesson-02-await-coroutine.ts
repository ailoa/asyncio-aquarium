import type { Lesson } from "../simulator/types";

export const lesson02: Lesson = {
  id: "lesson-02-await-coroutine",
  title: "Lesson 2 — Awaiting a coroutine runs it",
  concept:
    "await on a coroutine drives its body in the current task. No new task is created; the awaited coroutine runs inline.",
  code: `import asyncio

async def hello():
    print("hello")
    return 42

async def main():
    x = await hello()
    print(x)

asyncio.run(main())`,
  question: "What gets printed?",
  choices: [
    {
      id: "a",
      text: "42",
      isCorrect: false,
      feedback:
        "No. await hello() drives hello's body, so its print runs first.",
    },
    {
      id: "b",
      text: "hello",
      isCorrect: false,
      feedback:
        "Close, but main also prints x after the await returns 42.",
    },
    {
      id: "c",
      text: "hello\\n42",
      isCorrect: true,
      feedback:
        "Correct. await hello() runs hello's body (prints 'hello'), the call returns 42, then main prints x.",
    },
    {
      id: "d",
      text: "Nothing — hello() was never scheduled with create_task",
      isCorrect: false,
      feedback:
        "No. await is what drives a coroutine; create_task is one of two ways to run one, not the only way.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "main()",
      line: 11,
      note: "asyncio.run wraps main() in a task and starts the loop.",
    },
    { kind: "start_task", taskId: "main", line: 7 },
    {
      kind: "create_coroutine",
      coroutineId: "coro-hello",
      label: "hello()",
      line: 8,
      note: "Calling hello() builds a coroutine object — body has not run yet.",
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "coro-hello",
      yields: false,
      line: 8,
      note: "await drives hello's body inline in main's task. No yield to the loop.",
    },
    { kind: "print", taskId: "main", value: "hello", line: 4 },
    {
      kind: "note",
      line: 5,
      text: "hello() returns 42; control resumes in main after the await.",
    },
    { kind: "print", taskId: "main", value: "42", line: 9 },
    { kind: "complete", taskId: "main", line: 9 },
  ],
  explanation:
    "await coro runs the coroutine in the current task. There is no second task here — main and hello share the same task, the same call stack frame is suspended only if hello itself yields. Since hello does not yield, the whole thing runs straight through.",
};
