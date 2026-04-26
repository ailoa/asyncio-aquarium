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
        note: "Each request is a coroutine wrapped in a Task by uvicorn. It runs cooperatively with all other requests in the same event loop — it must await to yield control.",
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
        note: "Starlette drives the generator by calling __anext__() for each chunk. The generator is naturally backpressured — it cannot run ahead of the client.",
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
        note: "When a client disconnects, Starlette calls task.cancel(). CancelledError is injected at the next await, and finally runs unconditionally — the right place to close connections or flush logs.",
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
        note: "gather schedules both coroutines as tasks and awaits both. Total latency ≈ max(latency_a, latency_b), not their sum.",
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
        note: "wait_for wraps the coroutine in a task and cancels it if the deadline passes. The TimeoutError surfaces to your handler.",
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
        note: "create_task schedules the work without blocking the response. The task runs after your handler yields. Caveat: if the process restarts, the task is lost — use a real queue for durability.",
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
        note: "A blocking call holds the entire event loop hostage — no other request can make progress. to_thread offloads the blocking call to a thread pool, keeping the loop free.",
      },
      {
        pattern: "Async driver connection pool (asyncpg, motor, aiohttp…)",
        code: `async with pool.acquire() as conn:
    rows = await conn.fetch(query)
# connection returned to pool here`,
        lessons: [{ n: 15, label: "async context manager" }],
        note: "async with calls __aenter__ to check out a connection and __aexit__ to return it, even if an exception is raised. The pool's __aexit__ is the cleanup guarantee.",
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
        note: "uvicorn's default is one worker. All concurrent requests are tasks in the same loop. CPU-bound work or sync I/O must be pushed to a thread (to_thread) or process pool to avoid starving other requests.",
      },
      {
        pattern: "Multiple workers = multiple processes",
        code: `# uvicorn app:app --workers 4
# Four separate processes, four separate loops.
# No shared memory between workers.`,
        lessons: [{ n: 14, label: "to_thread" }],
        note: "Multiple workers scale throughput for CPU-bound work, but they do not share state. A cache or counter must be backed by Redis or a database — not a Python dict.",
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
        note: "Returns a list of results in the same order as the arguments. If any task raises, gather cancels the rest by default.",
      },
      {
        pattern: "Fire multiple tasks, abort on first failure",
        code: `async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(a())
    t2 = tg.create_task(b())`,
        lessons: [{ n: 12, label: "TaskGroup" }],
        note: "If any task raises, the TaskGroup cancels all sibling tasks. Errors are collected and re-raised as an ExceptionGroup.",
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
        note: "cancel() schedules CancelledError at the task's next await. Awaiting the cancelled task lets you observe when it has actually finished.",
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
      >
        {entry.code}
      </div>
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
