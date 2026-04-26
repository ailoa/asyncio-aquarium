import { describe, expect, it } from "vitest";
import { applyEvent, replayTrace } from "./applyEvent";
import { createInitialState } from "./initialState";
import { lessons } from "../lessons";
import type { TraceEvent } from "./types";

describe("applyEvent", () => {
  it("create_task adds to ready queue", () => {
    const s = applyEvent(createInitialState(), {
      kind: "create_task",
      parentTaskId: "main",
      taskId: "t1",
      label: "worker()",
    });
    expect(s.readyQueue).toEqual(["t1"]);
    expect(s.tasks.t1.status).toBe("ready");
  });

  it("start_task moves from ready to running", () => {
    const s = replayTrace([
      { kind: "create_task", parentTaskId: "main", taskId: "t1", label: "worker()" },
      { kind: "start_task", taskId: "t1" },
    ]);
    expect(s.runningTaskId).toBe("t1");
    expect(s.readyQueue).toEqual([]);
    expect(s.tasks.t1.status).toBe("running");
  });

  it("print appends to output", () => {
    const s = applyEvent(createInitialState(), {
      kind: "print",
      taskId: "main",
      value: "hello",
    });
    expect(s.output).toEqual(["hello"]);
  });

  it("sleep moves running task to sleeping", () => {
    const s = replayTrace([
      { kind: "create_task", parentTaskId: "main", taskId: "t1", label: "worker()" },
      { kind: "start_task", taskId: "t1" },
      { kind: "sleep", taskId: "t1", duration: 5 },
    ]);
    expect(s.runningTaskId).toBeUndefined();
    expect(s.sleepingTaskIds).toEqual(["t1"]);
    expect(s.tasks.t1.status).toBe("sleeping");
    expect(s.tasks.t1.wakeAt).toBe(5);
  });

  it("wake moves sleeping task back to ready", () => {
    const s = replayTrace([
      { kind: "create_task", parentTaskId: "main", taskId: "t1", label: "worker()" },
      { kind: "start_task", taskId: "t1" },
      { kind: "sleep", taskId: "t1", duration: 5 },
      { kind: "wake", taskId: "t1" },
    ]);
    expect(s.sleepingTaskIds).toEqual([]);
    expect(s.readyQueue).toEqual(["t1"]);
    expect(s.tasks.t1.status).toBe("ready");
  });

  it("complete moves running task to done", () => {
    const s = replayTrace([
      { kind: "create_task", parentTaskId: "main", taskId: "t1", label: "worker()" },
      { kind: "start_task", taskId: "t1" },
      { kind: "complete", taskId: "t1", result: "42" },
    ]);
    expect(s.doneTaskIds).toEqual(["t1"]);
    expect(s.runningTaskId).toBeUndefined();
    expect(s.tasks.t1.status).toBe("done");
    expect(s.tasks.t1.result).toBe("42");
  });

  it("cancel moves task to cancelled regardless of prior state", () => {
    const s = replayTrace([
      { kind: "create_task", parentTaskId: "main", taskId: "t1", label: "worker()" },
      { kind: "start_task", taskId: "t1" },
      { kind: "sleep", taskId: "t1", duration: 5 },
      { kind: "cancel", taskId: "t1" },
    ]);
    expect(s.cancelledTaskIds).toEqual(["t1"]);
    expect(s.sleepingTaskIds).toEqual([]);
    expect(s.tasks.t1.status).toBe("cancelled");
  });

  it("lesson 3 ordering: main prints first, worker prints after main yields", () => {
    const trace: TraceEvent[] = [
      { kind: "create_task", parentTaskId: "main", taskId: "main", label: "main()" },
      { kind: "start_task", taskId: "main" },
      { kind: "create_task", parentTaskId: "main", taskId: "worker", label: "worker()" },
      { kind: "print", taskId: "main", value: "main" },
      { kind: "sleep", taskId: "main", duration: 0 },
      { kind: "start_task", taskId: "worker" },
      { kind: "print", taskId: "worker", value: "worker" },
      { kind: "complete", taskId: "worker" },
      { kind: "wake", taskId: "main" },
      { kind: "start_task", taskId: "main" },
      { kind: "complete", taskId: "main" },
    ];
    const s = replayTrace(trace);
    expect(s.output).toEqual(["main", "worker"]);
  });
});

describe("lesson trace outputs", () => {
  const expected: Record<string, string[]> = {
    "lesson-01-coroutine-object": ["done"],
    "lesson-02-await-coroutine": ["hello", "42"],
    "lesson-03-create-task-schedules": ["main", "worker"],
    "lesson-04-task-switch-at-await": ["C", "A", "B", "D"],
    "lesson-05-sleep-time-order": ["A start", "B start", "B end", "A end"],
    "lesson-06-gather": ["A start", "B start", "A end", "B end", "done"],
    "lesson-07-cancellation": ["start", "cancelled", "main saw cancellation"],
    "lesson-08-timeout": ["timeout"],
    "lesson-09-coro-task-future": ["42", "42", "99"],
    "lesson-10-blocking-freezes-loop": ["blocking...", "done", "tick 1", "tick 2"],
    "lesson-11-async-for": ["1", "2", "3"],
    "lesson-12-task-group": ["A start", "B start", "A end", "B end", "after group"],
  };

  for (const lesson of lessons) {
    it(`${lesson.id} replays to the expected output`, () => {
      const s = replayTrace(lesson.trace);
      expect(s.output).toEqual(expected[lesson.id]);
    });
  }
});
