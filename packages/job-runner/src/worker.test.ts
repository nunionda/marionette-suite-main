import { describe, expect, it, vi } from "vitest";
import { createInMemoryAssetStorage } from "./storage";
import { createInMemoryJobQueue } from "./queue";
import {
  createAssetIngestHandler,
  wrapAsJobHandler,
} from "./worker";

describe("createAssetIngestHandler", () => {
  it("fetches URL and writes to storage", async () => {
    const bytes = new Uint8Array([9, 8, 7]);
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "video/mp4" }),
      arrayBuffer: async () => bytes.buffer,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const storage = createInMemoryAssetStorage();
    const q = createInMemoryJobQueue();
    q.register("ingest", createAssetIngestHandler(storage));

    const jobId = await q.submit("ingest", {
      url: "https://example.test/v.mp4",
      key: "ingested/v.mp4",
    });
    const final = await q.waitFor<{ storedUrl: string; bytes: number }>(
      jobId,
      { timeoutMs: 2000 },
    );
    expect(final.state).toBe("succeeded");
    expect(final.output?.bytes).toBe(3);
    expect(final.output?.storedUrl).toContain("ingested/v.mp4");

    vi.unstubAllGlobals();
  });

  it("propagates fetch failure as job error", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 503,
      headers: new Headers(),
      arrayBuffer: async () => new ArrayBuffer(0),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const storage = createInMemoryAssetStorage();
    const q = createInMemoryJobQueue();
    q.register("ingest", createAssetIngestHandler(storage));

    const jobId = await q.submit("ingest", {
      url: "https://example.test/dead",
      key: "x",
    });
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("failed");
    expect(final.error).toContain("503");

    vi.unstubAllGlobals();
  });
});

describe("wrapAsJobHandler", () => {
  it("reports boundary progress ticks", async () => {
    const q = createInMemoryJobQueue();
    q.register(
      "wrapped",
      wrapAsJobHandler<{ x: number }, number>(async (input) => input.x + 1),
    );
    const jobId = await q.submit("wrapped", { x: 41 });
    const final = await q.waitFor<number>(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("succeeded");
    expect(final.output).toBe(42);
    expect(final.progress).toBe(1);
  });

  it("forwards cancellation via AbortSignal", async () => {
    const q = createInMemoryJobQueue();
    q.register(
      "cancelable",
      wrapAsJobHandler<{}, string>(async (_, signal) => {
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 500);
          signal.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new Error("aborted"));
          });
        });
        return "done";
      }),
    );
    const jobId = await q.submit("cancelable", {});
    await new Promise((r) => setTimeout(r, 10));
    await q.cancel(jobId);
    const final = await q.waitFor(jobId, { timeoutMs: 2000 });
    expect(final.state).toBe("canceled");
  });
});
