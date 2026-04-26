import type { Lesson } from "../simulator/types";
import { lesson01 } from "./lesson-01-coroutine-object";
import { lesson02 } from "./lesson-02-await-coroutine";
import { lesson03 } from "./lesson-03-create-task-schedules";
import { lesson04 } from "./lesson-04-task-switch-at-await";
import { lesson05 } from "./lesson-05-sleep-time-order";
import { lesson06 } from "./lesson-06-gather";
import { lesson07 } from "./lesson-07-cancellation";
import { lesson08 } from "./lesson-08-timeout";

export const lessons: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
];
