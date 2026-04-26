import { createInitialState } from "./initialState";
import type { RuntimeState, Task, TraceEvent } from "./types";

const without = (arr: string[], id: string) => arr.filter((x) => x !== id);

function setTask(state: RuntimeState, id: string, patch: Partial<Task>): RuntimeState {
  const existing = state.tasks[id];
  if (!existing) return state;
  return { ...state, tasks: { ...state.tasks, [id]: { ...existing, ...patch } } };
}

export function applyEvent(state: RuntimeState, event: TraceEvent): RuntimeState {
  const next: RuntimeState = { ...state, timeline: [...state.timeline, event] };

  switch (event.kind) {
    case "create_coroutine": {
      return {
        ...next,
        coroutineObjects: {
          ...next.coroutineObjects,
          [event.coroutineId]: {
            id: event.coroutineId,
            label: event.label,
            consumed: false,
          },
        },
      };
    }

    case "create_task": {
      const task: Task = { id: event.taskId, label: event.label, status: "ready" };
      return {
        ...next,
        tasks: { ...next.tasks, [event.taskId]: task },
        readyQueue: [...next.readyQueue, event.taskId],
      };
    }

    case "start_task": {
      const withRunningSwapped = next.runningTaskId
        ? {
            ...setTask(next, next.runningTaskId, { status: "ready" }),
            readyQueue: [...next.readyQueue, next.runningTaskId],
          }
        : next;
      const withRun = setTask(withRunningSwapped, event.taskId, { status: "running" });
      return {
        ...withRun,
        runningTaskId: event.taskId,
        readyQueue: without(withRun.readyQueue, event.taskId),
      };
    }

    case "print": {
      return { ...next, output: [...next.output, event.value] };
    }

    case "await": {
      if (!event.yields) return next;
      const withWait = setTask(next, event.taskId, {
        status: "waiting",
        waitingFor: event.targetId,
      });
      return {
        ...withWait,
        runningTaskId:
          withWait.runningTaskId === event.taskId ? undefined : withWait.runningTaskId,
        waitingTaskIds: [...withWait.waitingTaskIds, event.taskId],
      };
    }

    case "sleep": {
      const withSleep = setTask(next, event.taskId, {
        status: "sleeping",
        wakeAt: next.time + event.duration,
      });
      return {
        ...withSleep,
        runningTaskId:
          withSleep.runningTaskId === event.taskId ? undefined : withSleep.runningTaskId,
        sleepingTaskIds: [...withSleep.sleepingTaskIds, event.taskId],
      };
    }

    case "wake": {
      const withReady = setTask(next, event.taskId, { status: "ready", wakeAt: undefined });
      return {
        ...withReady,
        sleepingTaskIds: without(withReady.sleepingTaskIds, event.taskId),
        waitingTaskIds: without(withReady.waitingTaskIds, event.taskId),
        readyQueue: [...withReady.readyQueue, event.taskId],
      };
    }

    case "complete": {
      const withDone = setTask(next, event.taskId, {
        status: "done",
        result: event.result,
      });
      return {
        ...withDone,
        runningTaskId:
          withDone.runningTaskId === event.taskId ? undefined : withDone.runningTaskId,
        readyQueue: without(withDone.readyQueue, event.taskId),
        sleepingTaskIds: without(withDone.sleepingTaskIds, event.taskId),
        waitingTaskIds: without(withDone.waitingTaskIds, event.taskId),
        doneTaskIds: [...withDone.doneTaskIds, event.taskId],
      };
    }

    case "cancel": {
      const withCancel = setTask(next, event.taskId, { status: "cancelled" });
      return {
        ...withCancel,
        runningTaskId:
          withCancel.runningTaskId === event.taskId ? undefined : withCancel.runningTaskId,
        readyQueue: without(withCancel.readyQueue, event.taskId),
        sleepingTaskIds: without(withCancel.sleepingTaskIds, event.taskId),
        waitingTaskIds: without(withCancel.waitingTaskIds, event.taskId),
        cancelledTaskIds: [...withCancel.cancelledTaskIds, event.taskId],
      };
    }

    case "raise": {
      return setTask(next, event.taskId, { status: "error", error: event.error });
    }

    case "time_advance": {
      return { ...next, time: event.to };
    }

    case "note":
      return next;
  }
}

export function replayTrace(events: TraceEvent[]): RuntimeState {
  return events.reduce(applyEvent, createInitialState());
}
