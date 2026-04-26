import type { Lesson } from "../simulator/types";
import { lesson01 } from "./lesson-01-coroutine-object";
import { lesson02 } from "./lesson-02-await-coroutine";
import { lesson03 } from "./lesson-03-create-task-schedules";
import { lesson04 } from "./lesson-04-task-switch-at-await";
import { lesson05 } from "./lesson-05-sleep-time-order";
import { lesson06 } from "./lesson-06-gather";
import { lesson07 } from "./lesson-07-cancellation";
import { lesson08 } from "./lesson-08-timeout";
import { lesson09 } from "./lesson-09-coro-task-future";
import { lesson10 } from "./lesson-10-blocking-freezes-loop";
import { lesson11 } from "./lesson-11-async-for";
import { lesson12 } from "./lesson-12-task-group";
import { lesson13 } from "./lesson-13-finally-on-cancel";
import { lesson14 } from "./lesson-14-to-thread";
import { lesson15 } from "./lesson-15-async-context-manager";
import { lesson16 } from "./lesson-16-backpressure";

export const lessons: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
  lesson15,
  lesson16,
];
