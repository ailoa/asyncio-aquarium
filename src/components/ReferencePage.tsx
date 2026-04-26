import Prism from "prismjs";
import "prismjs/components/prism-python";

type LessonLink = { n: number; label: string };

type Entry = {
  pattern: string;
  code: string;
  lessons: LessonLink[];
  note: string;
};

type Section = {
  heading: string;
  entries: Entry[];
};

const SECTIONS: Section[] = [
  {
    heading: "FastAPI / Starlette",
    entries: [
      {
        pattern: "async def endpoint",
        code: `@app.get("/items/{id}")
async def get_item(id: int):
    result = await db.fetch(id)
    return result`,
        lessons: [
          { n: 1, label: "coroutine object" },
          { n: 2, label: "await" },
          { n: 4, label: "task switching" },
        ],
        note: "Each request is a coroutine wrapped in a Task by uvicorn. It runs cooperatively with all other requests in the same event loop — it must await to yield control. While your handler is awaiting a database call, the loop is free to start another request. This is why a single-threaded event loop can handle thousands of concurrent connections, as long as every I/O operation is async.",
      },
      {
        pattern: "StreamingResponse with async generator",
        code: `async def token_stream():
    async for chunk in model.generate():
        yield chunk

@app.get("/stream")
async def stream():
    return StreamingResponse(token_stream())`,
        lessons: [
          { n: 11, label: "async for" },
          { n: 16, label: "backpressure" },
          { n: 17, label: "streaming & disconnect" },
        ],
        note: "Starlette drives the generator by calling __anext__() for each chunk. The generator is naturally backpressured — it cannot run ahead of the client. If the client is slow, the generator pauses at yield and the loop is free to handle other requests. Each await inside the generator is a real yield point to the event loop, so streaming never blocks.",
      },
      {
        pattern: "Cleanup on client disconnect",
        code: `async def token_stream():
    try:
        async for chunk in model.generate():
            yield chunk
    finally:
        print("stream closed")  # always runs`,
        lessons: [
          { n: 7, label: "cancellation" },
          { n: 13, label: "finally on cancel" },
          { n: 17, label: "streaming & disconnect" },
        ],
        note: "When a client disconnects, Starlette calls task.cancel(). CancelledError is injected at the next await point — not immediately, but at the next time your code suspends. The finally block then runs unconditionally, making it the right place to release a database connection, flush a buffer, or record partial usage. Keep finally blocks short and avoid long awaits inside them, since those can also be cancelled.",
      },
      {
        pattern: "Parallel I/O in one request",
        code: `@app.get("/dashboard")
async def dashboard():
    users, stats = await asyncio.gather(
        fetch_users(),
        fetch_stats(),
    )
    return {"users": users, "stats": stats}`,
        lessons: [{ n: 6, label: "gather" }],
        note: "gather schedules both coroutines as tasks and awaits both. Total latency ≈ max(latency_a, latency_b), not their sum — so two 100 ms database calls take 100 ms total, not 200 ms. If any task raises an exception, gather cancels the remaining tasks by default. Use return_exceptions=True if you want all results even when some fail.",
      },
      {
        pattern: "Request timeout",
        code: `@app.get("/slow")
async def slow():
    try:
        result = await asyncio.wait_for(
            fetch_external(), timeout=3.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(504)`,
        lessons: [{ n: 8, label: "wait_for timeout" }],
        note: "wait_for wraps the coroutine in a task and cancels it if the deadline passes. The TimeoutError surfaces to your handler, letting you return a 504 or a cached fallback. The cancelled task's finally block still runs, so resources are cleaned up. In Python 3.11+ you can also use asyncio.timeout() as an async context manager for the same effect.",
      },
      {
        pattern: "Background task after response",
        code: `@app.post("/ingest")
async def ingest(data: dict):
    asyncio.create_task(process_later(data))
    return {"status": "accepted"}`,
        lessons: [
          { n: 3, label: "create_task" },
          { n: 4, label: "task switching" },
        ],
        note: "create_task schedules the work without blocking the response. The task runs after your handler yields control — typically on the next iteration of the event loop. Caveat: if the process restarts the task is lost, there is no retry, and exceptions are silently dropped unless you add a done callback. For anything that must not be lost, use a real task queue (Celery, ARQ, etc.).",
      },
    ],
  },
  {
    heading: "Database & I/O drivers",
    entries: [
      {
        pattern: "Synchronous driver (psycopg2, sqlite3, requests…)",
        code: `import asyncio

result = await asyncio.to_thread(db.execute, query)`,
        lessons: [
          { n: 10, label: "blocking freezes loop" },
          { n: 14, label: "to_thread" },
        ],
        note: "A blocking call holds the entire event loop hostage — no other request can make progress while it runs. to_thread offloads the call to Python's default ThreadPoolExecutor, keeping the loop free. The result is awaited back on the loop thread when the OS thread finishes. Note that sharing mutable state between the thread and the loop is not safe without a lock — asyncio primitives like asyncio.Queue are not thread-safe by default.",
      },
      {
        pattern: "Async driver connection pool (asyncpg, motor, aiohttp…)",
        code: `async with pool.acquire() as conn:
    rows = await conn.fetch(query)
# connection returned to pool here`,
        lessons: [{ n: 15, label: "async context manager" }],
        note: "async with calls __aenter__ to check out a connection and __aexit__ to return it, even if an exception is raised — the same guarantee as a regular with statement. Connection pools like asyncpg's Pool keep a fixed number of real connections alive; acquire() waits if they are all in use. Without async with you risk leaking connections under errors, eventually exhausting the pool.",
      },
    ],
  },
  {
    heading: "uvicorn workers",
    entries: [
      {
        pattern: "Single worker = single event loop",
        code: `# uvicorn app:app --workers 1
# All requests share one loop — one thread.
# A blocking call blocks EVERY request.`,
        lessons: [
          { n: 4, label: "task switching" },
          { n: 10, label: "blocking freezes loop" },
        ],
        note: "uvicorn's default is one worker process with one event loop. Every concurrent request is a task in that loop. Because there is only one OS thread, CPU-bound work or a blocking call blocks all other requests. Push that work to to_thread (for IO-bound sync code) or ProcessPoolExecutor (for CPU-bound code). The GIL also means threads don't achieve true CPU parallelism in CPython — processes are the right tool for CPU work.",
      },
      {
        pattern: "Multiple workers = multiple processes",
        code: `# uvicorn app:app --workers 4
# Four separate processes, four separate loops.
# No shared memory between workers.`,
        lessons: [{ n: 14, label: "to_thread" }],
        note: "Multiple workers are separate processes — each has its own event loop and its own copy of all Python objects. They cannot share a dict, a list, or an in-memory cache. Any state that must be visible across workers (rate limit counters, session data, a cache) needs an external store like Redis or Postgres. This is also why asyncio primitives like asyncio.Lock don't work across workers.",
      },
    ],
  },
  {
    heading: "asyncio patterns quick-ref",
    entries: [
      {
        pattern: "Fire multiple tasks, wait for all",
        code: `results = await asyncio.gather(a(), b(), c())`,
        lessons: [{ n: 6, label: "gather" }],
        note: "Returns results in the same order as the arguments regardless of completion order. If any task raises, gather cancels the remaining tasks and re-raises the first exception. Pass return_exceptions=True to collect all results and exceptions without cancelling siblings.",
      },
      {
        pattern: "Fire multiple tasks, abort on first failure",
        code: `async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(a())
    t2 = tg.create_task(b())`,
        lessons: [{ n: 12, label: "TaskGroup" }],
        note: "If any task raises, the TaskGroup cancels all sibling tasks and waits for them to finish before re-raising. Multiple exceptions are collected into an ExceptionGroup, which you can catch with except*. TaskGroup is the preferred pattern in Python 3.11+ — it makes structured concurrency explicit: tasks cannot outlive the block they were created in.",
      },
      {
        pattern: "Cancel a long-running task",
        code: `task = asyncio.create_task(worker())
task.cancel()
try:
    await task
except asyncio.CancelledError:
    pass`,
        lessons: [
          { n: 7, label: "cancellation" },
          { n: 13, label: "finally on cancel" },
        ],
        note: "cancel() schedules CancelledError to be raised at the task's next await point — it does not stop the task immediately. Awaiting the task (inside try/except CancelledError) lets you observe when it has actually finished and suppress the error. If you don't await it, the task is eventually garbage-collected, but its finally block may not have run yet.",
      },
    ],
  },
];

type Props = {
  onSelectLesson: (n: number) => void;
};

export function ReferencePage({ onSelectLesson }: Props) {
  return (
    <div
      style={{
        padding: "24px 32px 48px",
        overflowY: "auto",
        height: "100vh",
        background: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: "var(--text-mute)",
              marginBottom: 6,
            }}
          >
            In the Wild
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>
            Library Pattern Reference
          </h1>
          <p style={{ marginTop: 8, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Real patterns from FastAPI, uvicorn, and async drivers — mapped to the lesson that explains the underlying mechanism.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.heading} style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.7,
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "1px solid var(--border)",
              }}
            >
              {section.heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.entries.map((entry) => (
                <EntryCard
                  key={entry.pattern}
                  entry={entry}
                  onSelectLesson={onSelectLesson}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  onSelectLesson,
}: {
  entry: Entry;
  onSelectLesson: (n: number) => void;
}) {
  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-panel-alt)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>{entry.pattern}</span>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {entry.lessons.map((l) => (
            <button
              key={l.n}
              onClick={() => onSelectLesson(l.n)}
              title={l.label}
              style={{
                padding: "2px 8px",
                borderRadius: 99,
                border: "1px solid var(--accent)",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              L{l.n}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "12px 14px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12.5,
          lineHeight: 1.65,
          whiteSpace: "pre",
          overflowX: "auto",
          color: "var(--text)",
          borderBottom: "1px solid var(--border)",
        }}
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(entry.code, Prism.languages.python, "python"),
        }}
      />
      <div
        style={{
          padding: "10px 14px",
          fontSize: 12.5,
          color: "var(--text-dim)",
          lineHeight: 1.6,
        }}
      >
        {entry.note}
      </div>
    </div>
  );
}
