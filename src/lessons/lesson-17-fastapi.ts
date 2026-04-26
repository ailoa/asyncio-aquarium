import type { Lesson } from "../simulator/types";

export const lesson17: Lesson = {
  id: "lesson-17-fastapi",
  title: "Lesson 17 — FastAPI: streaming and disconnect",
  concept:
    "FastAPI runs each request handler as a coroutine in uvicorn's event loop. When a client disconnects mid-stream, Starlette cancels the handler task — CancelledError is injected at the next await, and finally runs for cleanup.",
  code: `import asyncio
from fastapi.responses import StreamingResponse

async def token_stream():
    try:
        for token in ["Hello", " world", "!"]:
            await asyncio.sleep(0.1)  # simulate model generating
            yield token
    finally:
        print("stream closed")

async def stream():
    return StreamingResponse(token_stream(), media_type="text/plain")`,
  question: "The client disconnects after receiving 'Hello'. What does the server print?",
  choices: [
    {
      id: "a",
      text: "nothing — the task is cancelled before anything can print",
      isCorrect: false,
      feedback:
        "No. finally is unconditional — it runs even when a task is cancelled. 'stream closed' will always print.",
    },
    {
      id: "b",
      text: "stream closed",
      isCorrect: true,
      feedback:
        "Correct. Starlette calls task.cancel(). CancelledError is injected at the next await sleep(0.1). The try block exits; finally runs and prints 'stream closed'.",
    },
    {
      id: "c",
      text: "Hello\nstream closed",
      isCorrect: false,
      feedback:
        "No. 'Hello' is yielded to the client (returned over HTTP), not printed to the server log. Only the finally block prints.",
    },
    {
      id: "d",
      text: "An uncaught CancelledError is raised — nothing prints",
      isCorrect: false,
      feedback:
        "No. CancelledError is raised inside the try block, which triggers the finally block. CancelledError propagates after finally completes, but the print happens first.",
    },
  ],
  trace: [
    {
      kind: "create_task",
      parentTaskId: "runtime",
      taskId: "main",
      label: "stream()",
      line: 12,
    },
    {
      kind: "start_task",
      taskId: "main",
      line: 12,
    },
    {
      kind: "note",
      line: 12,
      text: "StreamingResponse wraps token_stream(). Starlette calls __anext__() to pull each chunk from the generator.",
    },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0.1,
      line: 7,
      note: "Generator hits await sleep(0.1) on the first token. stream() suspends.",
    },
    {
      kind: "wake",
      taskId: "main",
      line: 7,
      note: "Generator yields 'Hello'. Starlette sends the chunk to the client.",
    },
    {
      kind: "sleep",
      taskId: "main",
      duration: 0.1,
      line: 7,
      note: "Generator hits await sleep(0.1) for the second token.",
    },
    {
      kind: "note",
      line: 7,
      text: "While stream() is suspended, the client disconnects. Starlette detects this and calls task.cancel() on the handler.",
    },
    {
      kind: "wake",
      taskId: "main",
      line: 7,
      note: "CancelledError is injected at sleep(0.1). The try block exits immediately — ' world' and '!' are never yielded.",
    },
    {
      kind: "start_task",
      taskId: "main",
      line: 9,
      note: "Execution enters the finally block.",
    },
    {
      kind: "print",
      taskId: "main",
      value: "stream closed",
      line: 10,
    },
    {
      kind: "cancel",
      taskId: "main",
      line: 10,
      note: "CancelledError propagates out of finally. The handler task ends as cancelled.",
    },
  ],
  explanation:
    "uvicorn runs a single event loop per worker process. Every HTTP request is a task in that loop. When a client disconnects, Starlette (the ASGI framework under FastAPI) calls task.cancel() on the handler — the same mechanism you saw in Lesson 7. CancelledError is injected at the next await, and finally is unconditional (Lesson 13), making it the right place to release connections, flush logs, or record partial usage. This pattern composes naturally with the backpressure from Lesson 16: because StreamingResponse pulls from the async generator one chunk at a time, cancellation always hits at a yield point — there is no risk of the generator running ahead after the client is gone.",
};
