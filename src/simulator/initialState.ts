import type { RuntimeState } from "./types";

export function createInitialState(): RuntimeState {
  return {
    time: 0,
    runningTaskId: undefined,
    readyQueue: [],
    sleepingTaskIds: [],
    waitingTaskIds: [],
    doneTaskIds: [],
    cancelledTaskIds: [],
    tasks: {},
    coroutineObjects: {},
    output: [],
    timeline: [],
  };
}
