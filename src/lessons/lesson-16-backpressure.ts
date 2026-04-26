import type { Lesson } from "../simulator/types";

export const lesson16: Lesson = {
  id: "lesson-16-backpressure",
  title: "Lesson 16 — Backpressure: yield suspends the producer",
  concept:
    "In an async generator, each yield suspends the producer until the consumer asks for the next item. The producer cannot run ahead — it is naturally limited by how fast the consumer pulls.",
  code: `import asyncio

async def producer():
    for i in range(3):
        print("produce", i)
        yield i
        await asyncio.sleep(0)

async def consumer():
    async for item in producer():
        print("consume", item)
        await asyncio.sleep(0)

asyncio.run(consumer())`,
  question: "What gets printed, in order?",
  choices: [
    {
      id: "a",
      text: "produce 0\nproduce 1\nproduce 2\nconsume 0\nconsume 1\nconsume 2",
      isCorrect: false,
      feedback:
        "No. The producer is suspended at each yield until the consumer asks for the next item — it cannot run ahead.",
    },
    {
      id: "b",
      text: "produce 0\nconsume 0\nproduce 1\nconsume 1\nproduce 2\nconsume 2",
      isCorrect: true,
      feedback:
        "Correct. Each yield hands one value to the consumer. The producer is suspended until the consumer processes the item and calls __anext__ again.",
    },
    {
      id: "c",
      text: "consume 0\nproduce 0\nconsume 1\nproduce 1\nconsume 2\nproduce 2",
      isCorrect: false,
      feedback:
        "No. The producer runs first on each iteration — it must reach 'yield' before the consumer has anything.",
    },
    {
      id: "d",
      text: "produce 0\nconsume 0\nconsume 1\nproduce 1\nproduce 2\nconsume 2",
      isCorrect: false,
      feedback:
        "No. The interleaving is strict: one produce then one consume per iteration.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "consumer()",
      line: 14,
    },
    { kind: "start_task", taskId: "main", line: 9 },
    {
      kind: "note",
      line: 9,
      text: "async for calls __anext__(), driving the producer until it hits yield or returns.",
    },
    { kind: "print", taskId: "main", value: "produce 0", line: 5 },
    {
      kind: "note",
      line: 6,
      text: "yield 0 — producer is suspended. Consumer receives the value.",
    },
    { kind: "print", taskId: "main", value: "consume 0", line: 11 },
    { kind: "sleep", taskId: "main", duration: 0, line: 12, note: "Consumer yields." },
    { kind: "wake", taskId: "main", line: 12 },
    {
      kind: "note",
      line: 9,
      text: "__anext__() called again. Producer resumes from after the yield.",
    },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0,
      line: 7,
      note: "Producer hits sleep(0) — yields again.",
    },
    { kind: "wake", taskId: "main", line: 7 },
    { kind: "start_task", taskId: "main", line: 5 },
    { kind: "print", taskId: "main", value: "produce 1", line: 5 },
    {
      kind: "note",
      line: 6,
      text: "yield 1 — producer suspended. Consumer receives the value.",
    },
    { kind: "print", taskId: "main", value: "consume 1", line: 11 },
    { kind: "sleep", taskId: "main", duration: 0, line: 12 },
    { kind: "wake", taskId: "main", line: 12 },
    {
      kind: "note",
      line: 9,
      text: "__anext__() called again. Producer resumes.",
    },
    { kind: "sleep", taskId: "main", duration: 0, line: 7 },
    { kind: "wake", taskId: "main", line: 7 },
    { kind: "start_task", taskId: "main", line: 5 },
    { kind: "print", taskId: "main", value: "produce 2", line: 5 },
    {
      kind: "note",
      line: 6,
      text: "yield 2 — producer suspended. Consumer receives the value.",
    },
    { kind: "print", taskId: "main", value: "consume 2", line: 11 },
    { kind: "sleep", taskId: "main", duration: 0, line: 12 },
    { kind: "wake", taskId: "main", line: 12 },
    {
      kind: "note",
      line: 9,
      text: "__anext__() called again. Producer hits sleep(0), loops, then range(3) is exhausted — StopAsyncIteration. async for exits.",
    },
    { kind: "complete", taskId: "main", line: 14 },
  ],
  explanation:
    "Backpressure is the producer slowing down when the consumer is slow. In an async generator, yield is both the handoff mechanism and the backpressure mechanism — the producer is suspended until the consumer calls __anext__. No extra queuing or signalling needed. This is why FastAPI's StreamingResponse can consume an async generator safely: if the client is slow, the generator pauses at yield and the event loop can do other work.",
};
