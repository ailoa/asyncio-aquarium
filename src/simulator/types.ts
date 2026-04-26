type EventBase = { line?: number };

export type TraceEvent = EventBase &
  (
    | { kind: "create_coroutine"; coroutineId: string; label: string; note?: string }
    | { kind: "create_task"; parentTaskId: string; taskId: string; label: string; note?: string }
    | { kind: "start_task"; taskId: string; note?: string }
    | { kind: "print"; taskId: string; value: string; note?: string }
    | { kind: "await"; taskId: string; targetId: string; yields: boolean; note?: string }
    | { kind: "sleep"; taskId: string; duration: number; note?: string }
    | { kind: "wake"; taskId: string; note?: string }
    | { kind: "complete"; taskId: string; result?: string; note?: string }
    | { kind: "cancel"; taskId: string; note?: string }
    | { kind: "raise"; taskId: string; error: string; note?: string }
    | { kind: "time_advance"; to: number; note?: string }
    | { kind: "note"; text: string }
  );

export type TaskStatus =
  | "ready"
  | "running"
  | "sleeping"
  | "waiting"
  | "done"
  | "cancelled"
  | "error";

export type Task = {
  id: string;
  label: string;
  status: TaskStatus;
  waitingFor?: string;
  wakeAt?: number;
  result?: string;
  error?: string;
};

export type CoroutineObject = {
  id: string;
  label: string;
  consumed: boolean;
};

export type RuntimeState = {
  time: number;
  runningTaskId?: string;
  readyQueue: string[];
  sleepingTaskIds: string[];
  waitingTaskIds: string[];
  doneTaskIds: string[];
  cancelledTaskIds: string[];
  tasks: Record<string, Task>;
  coroutineObjects: Record<string, CoroutineObject>;
  output: string[];
  timeline: TraceEvent[];
};

export type Choice = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

export type Lesson = {
  id: string;
  title: string;
  concept: string;
  code: string;
  question: string;
  choices: Choice[];
  trace: TraceEvent[];
  explanation: string;
};
