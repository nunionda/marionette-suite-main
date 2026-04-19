import { describe, expect, it } from "vitest";
import { createInMemoryJobQueue } from "./queue";
import type { ProgressEvent } from "./progress";

describe("InMemoryJobQueue", () => {
  it("runs a successful job and records output", async () => {
    const q = createInMemoryJobQueue();
    q.register<{ n: number }, number>("square", async (input) => input.n * input.n);

    const jobId = await q.submit("square", { n: 7 });
    const final = await q.waitFor<number>(jobId, { timeoutMs: 2000 });

    expect(final.state).toBe("succeeded");
    expect(final.output).toBe(49);
    expect(final.progress).toBe(1);
  });

  it("records failure with error message", async () => {
    const q = createInMemoryJobQueue();
    q.register("fail", async () => {
      throw new Error("simulated");
    });

    const jobId = await q.submit("fail", {});
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("failed");
    expect(final.error).toContain("simulated");
  });

  it("retries up to maxAttempts then fails", async () => {
    const q = createInMemoryJobQueue();
    let tries = 0;
    q.register("flaky", async () => {
      tries++;
      if (tries < 3) throw new Error("transient");
      return "ok";
    });

    const jobId = await q.submit("flaky", {}, {
      maxAttempts: 3,
      retryDelayMs: 5,
    });
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("succeeded");
    expect(final.attempts).toBe(3);
    expect(final.output).toBe("ok");
  });

  it("retries exhaust → failed", async () => {
    const q = createInMemoryJobQueue();
    q.register("always-fail", async () => {
      throw new Error("down");
    });
    const jobId = await q.submit("always-fail", {}, {
      maxAttempts: 2,
      retryDelayMs: 5,
    });
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("failed");
    expect(final.attempts).toBe(2);
  });

  it("unknown job type fails clearly", async () => {
    const q = createInMemoryJobQueue();
    const jobId = await q.submit("unregistered", {});
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("failed");
    expect(final.error).toMatch(/handler registered/i);
  });

  it("cancel before start marks the job canceled", async () => {
    const q = createInMemoryJobQueue({ concurrency: 1 });
    q.register("slow", async (_input, ctx) => {
      await new Promise((r) => setTimeout(r, 100));
      if (ctx.signal.aborted) throw new Error("aborted");
      return "done";
    });

    const first = await q.submit("slow", {});
    const second = await q.submit("slow", {});
    // Second is still queued — cancel it before it runs.
    expect(await q.cancel(second)).toBe(true);

    const status = await q.getStatus(second);
    expect(status?.state).toBe("canceled");

    // First still completes.
    const firstFinal = await q.waitFor(first, { timeoutMs: 2000 });
    expect(firstFinal.state).toBe("succeeded");
  });

  it("cancel during run aborts via signal", async () => {
    const q = createInMemoryJobQueue();
    q.register("abortable", async (_input, ctx) => {
      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, 1000);
        ctx.signal.addEventListener("abort", () => {
          clearTimeout(t);
          reject(new Error("aborted by signal"));
        });
      });
      return "done";
    });

    const jobId = await q.submit("abortable", {});
    // Give it a moment to start running.
    await new Promise((r) => setTimeout(r, 20));
    await q.cancel(jobId);
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("canceled");
  });

  it("reportProgress publishes events", async () => {
    const q = createInMemoryJobQueue();
    const events: ProgressEvent[] = [];
    q.progress.subscribeAll((ev) => events.push(ev));

    q.register("stepped", async (_input, ctx) => {
      ctx.reportProgress(0.3, "one third");
      ctx.reportProgress(0.6, "two thirds");
      return 42;
    });

    const jobId = await q.submit("stepped", {});
    await q.waitFor(jobId, { timeoutMs: 2000 });

    const progresses = events
      .filter((e) => e.jobId === jobId && e.progress !== undefined)
      .map((e) => e.progress!);
    expect(progresses).toContain(0.3);
    expect(progresses).toContain(0.6);
    // Terminal event
    expect(events.find((e) => e.state === "succeeded")).toBeDefined();
  });

  it("concurrency gates parallel running jobs", async () => {
    const q = createInMemoryJobQueue({ concurrency: 2 });
    let active = 0;
    let peak = 0;
    q.register("track", async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 30));
      active--;
      return "ok";
    });

    const ids = await Promise.all(
      Array.from({ length: 6 }, () => q.submit("track", {})),
    );
    await Promise.all(ids.map((id) => q.waitFor(id, { timeoutMs: 2000 })));
    expect(peak).toBeLessThanOrEqual(2);
    expect(peak).toBeGreaterThan(0);
  });

  it("waitFor resolves immediately if already terminal", async () => {
    const q = createInMemoryJobQueue();
    q.register("quick", async () => 1);
    const id = await q.submit("quick", {});
    await q.waitFor(id, { timeoutMs: 2000 });
    // Second waitFor should not hang.
    const again = await q.waitFor(id, { timeoutMs: 200 });
    expect(again.state).toBe("succeeded");
  });
});
