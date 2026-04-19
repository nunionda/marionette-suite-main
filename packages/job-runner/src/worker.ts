/**
 * Worker helpers — thin utilities for orchestrator → queue wiring.
 *
 * The orchestrators (cinema / marketing / co-director / soul-trainer) all
 * share a similar pattern when run durably:
 *
 *   1. Submit with input
 *   2. Handler invokes the orchestrator with a progress-reporting shim
 *   3. Output is stashed via AssetStorage (for video/image/audio) and the
 *      URL/key is returned as the job output
 *   4. Retry on transient vendor failures (opt-in per job)
 *
 * This module doesn't know about any specific orchestrator — Sprint 15
 * (Hub UI) composes these at the composition root with real engines.
 * Keeping it generic means the Sprint 13 engines stay framework-free.
 */
import type { JobHandler } from "./types";
import type { AssetStorage } from "./storage";

/**
 * Wrap a "fetch bytes from a URL → store them" flow into a job handler.
 * Use case: a video provider returns an external URL with short TTL, and
 * we want a durable copy.
 */
export function createAssetIngestHandler(
  storage: AssetStorage,
): JobHandler<{ url: string; key: string; mime?: string }, { storedUrl: string; bytes: number }> {
  return async (input, ctx) => {
    ctx.reportProgress(0.1, `Fetching ${input.url}`);
    const res = await fetch(input.url, { signal: ctx.signal });
    if (!res.ok) {
      throw new Error(`Ingest fetch failed ${res.status}: ${input.url}`);
    }
    ctx.reportProgress(0.5, "Writing to storage");
    const buf = new Uint8Array(await res.arrayBuffer());
    const stored = await storage.put(buf, {
      key: input.key,
      mime: input.mime ?? res.headers.get("content-type") ?? undefined,
    });
    ctx.reportProgress(1.0, "Done");
    return { storedUrl: stored.url, bytes: stored.bytes };
  };
}

/**
 * Generic wrapper: run an async function with its own AbortSignal wired
 * to the job context. Useful when an orchestrator accepts a signal but
 * doesn't natively report progress — the wrapper emits a single "running"
 * tick at the start and 100% at the end.
 */
export function wrapAsJobHandler<Input, Output>(
  fn: (input: Input, signal: AbortSignal) => Promise<Output>,
): JobHandler<Input, Output> {
  return async (input, ctx) => {
    ctx.reportProgress(0.01, "Starting");
    const out = await fn(input, ctx.signal);
    ctx.reportProgress(1.0, "Done");
    return out;
  };
}
