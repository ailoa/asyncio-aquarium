import type { Lesson } from "../simulator/types";

export const lesson14: Lesson = {
  id: "lesson-14-to-thread",
  title: "Lesson 14 — asyncio.to_thread for blocking work",
  concept:
    "An OS thread is a separate line of execution managed by the operating system — unlike asyncio tasks, which share one thread and take turns, OS threads can run at the same time on different CPU cores. asyncio.to_thread() moves a blocking function into one of these threads so the event loop stays free to run other tasks concurrently.",
  code: `import asyncio
import time

def blocking_work():
    time.sleep(0.5)
    return "result"

async def ticker():
    for i in range(3):
        print("tick", i)
        await asyncio.sleep(0.4)

async def main():
    t = asyncio.create_task(ticker())
    result = await asyncio.to_thread(blocking_work)
    print(result)
    await t

asyncio.run(main())`,
  question: "When does 'result' print, relative to the ticks?",
  choices: [
    {
      id: "a",
      text: "Before any tick — to_thread is instant.",
      isCorrect: false,
      feedback:
        "No. blocking_work takes 0.5s, which is more than one tick interval.",
    },
    {
      id: "b",
      text: "After all ticks — to_thread still blocks the loop.",
      isCorrect: false,
      feedback:
        "No. to_thread runs blocking_work in a separate thread. The loop is free, so ticker keeps running in parallel.",
    },
    {
      id: "c",
      text: "Between tick 1 and tick 2.",
      isCorrect: true,
      feedback:
        "Correct. The thread finishes at t=0.5s. ticker's next wake is at t=0.8s. So result prints in between — proof the thread ran concurrently with the loop.",
    },
    {
      id: "d",
      text: "Between tick 0 and tick 1.",
      isCorrect: false,
      feedback:
        "No. blocking_work takes 0.5s, but tick 1 fires at t=0.4s — the thread isn't done yet.",
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
      text: "to_thread(blocking_work) starts blocking_work in an OS thread. The loop is free immediately.",
    },
    {
      kind: "await",
      taskId: "main",
      targetId: "to_thread",
      yields: true,
      line: 15,
      note: "main suspends. Thread runs concurrently while the loop schedules other tasks.",
    },
    { kind: "start_task", taskId: "ticker", line: 10 },
    { kind: "print", taskId: "ticker", value: "tick 0", line: 10 },
    { kind: "sleep", taskId: "ticker", duration: 0.4, line: 11 },
    {
      kind: "time_advance",
      to: 0.4,
      note: "t=0.4s — ticker's timer fires. Thread still running.",
    },
    { kind: "wake", taskId: "ticker", line: 11 },
    { kind: "start_task", taskId: "ticker", line: 10 },
    { kind: "print", taskId: "ticker", value: "tick 1", line: 10 },
    { kind: "sleep", taskId: "ticker", duration: 0.4, line: 11 },
    {
      kind: "time_advance",
      to: 0.5,
      note: "t=0.5s — blocking_work finishes in its thread. main is woken. ticker still sleeping until t=0.8.",
    },
    {
      kind: "wake",
      taskId: "main",
      line: 15,
      note: "Thread done. main resumes before ticker's next tick.",
    },
    { kind: "start_task", taskId: "main", line: 16 },
    { kind: "print", taskId: "main", value: "result", line: 16 },
    {
      kind: "await",
      taskId: "main",
      targetId: "ticker",
      yields: true,
      line: 17,
      note: "main waits for ticker to finish.",
    },
    {
      kind: "time_advance",
      to: 0.8,
      note: "t=0.8s — ticker's timer fires.",
    },
    { kind: "wake", taskId: "ticker", line: 11 },
    { kind: "start_task", taskId: "ticker", line: 10 },
    { kind: "print", taskId: "ticker", value: "tick 2", line: 10 },
    {
      kind: "note",
      line: 9,
      text: "range(3) exhausted after i=2. ticker returns.",
    },
    { kind: "complete", taskId: "ticker", line: 11 },
    { kind: "wake", taskId: "main", line: 17 },
    { kind: "start_task", taskId: "main", line: 17 },
    { kind: "complete", taskId: "main", line: 18 },
  ],
  explanation:
    "to_thread is not just 'yields and comes back later' — the blocking function runs in a real OS thread, concurrently with the event loop. That's why result can appear between two ticks. Compare with lesson 10: time.sleep inside the loop froze everything; to_thread moves the blocking call off the loop entirely. Thread safety is your responsibility: don't share mutable async state with the thread.",
};
