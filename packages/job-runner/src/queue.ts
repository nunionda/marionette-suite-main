/**
 * JobQueue — durable execution + retry + progress.
 *
 * Interface-first. In-memory impl ships today for dev + tests; a future
 * Redis+BullMQ impl slots in at the composition root (plan B.8).
 *
 * Semantics:
 *
 *   - register(type, handler)       — install a handler for a job type
 *   - submit(type, input, opts)     — queue a new job, returns jobId
 *   - getStatus(jobId)              — poll
 *   - cancel(jobId)                 — request cancellation (handler's
 *                                     AbortSignal fires)
 *   - waitFor(jobId)                — await terminal state
 *
 * Retry: when a handler throws and attempts < maxAttempts, the job is
 * re-queued after retryDelayMs. Final failures emit `{ state: 'failed' }`
 * via the progress bus.
 */
import type {
  JobHandler,
  JobHandlerContext,
  JobRecord,
  SubmitOptions,
} from "./types";
import type { ProgressBus } from "./progress";
import { createInMemoryProgressBus } from "./progress";

export interface JobQueue {
  register<Input, Output>(
    type: string,
    handler: JobHandler<Input, Output>,
  ): void;
  submit<Input, Output = unknown>(
    type: string,
    input: Input,
    opts?: SubmitOptions,
  ): Promise<string>;
  getStatus<Output = unknown>(
    jobId: string,
  ): Promise<JobRecord<unknown, Output> | undefined>;
  cancel(jobId: string): Promise<boolean>;
  /** Await terminal state (success / fail / cancel). */
  waitFor<Output = unknown>(
    jobId: string,
    opts?: { timeoutMs?: number },
  ): Promise<JobRecord<unknown, Output>>;
  readonly progress: ProgressBus;
}

export interface InMemoryQueueOptions {
  /** Max parallel running jobs. Default 4. */
  concurrency?: number;
  progressBus?: ProgressBus;
}

function makeJobId(): string {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createInMemoryJobQueue(
  opts: InMemoryQueueOptions = {},
): JobQueue {
  const concurrency = opts.concurrency ?? 4;
  const progress = opts.progressBus ?? createInMemoryProgressBus();
  const handlers = new Map<string, JobHandler<any, any>>();
  const jobs = new Map<string, JobRecord>();
  const aborts = new Map<string, AbortController>();
  const pending: string[] = [];
  let running = 0;

  function publish(rec: JobRecord) {
    progress.publish({
      jobId: rec.id,
      state: rec.state,
      progress: rec.progress,
      note: rec.progressNote,
      error: rec.error,
      at: Date.now(),
    });
  }

  async function runOne(jobId: string) {
    const rec = jobs.get(jobId);
    if (!rec) return;

    const handler = handlers.get(rec.type);
    if (!handler) {
      rec.state = "failed";
      rec.error = `No handler registered for job type "${rec.type}"`;
      rec.finishedAt = Date.now();
      publish(rec);
      return;
    }

    const abort = new AbortController();
    aborts.set(jobId, abort);

    rec.state = "running";
    rec.startedAt = rec.startedAt ?? Date.now();
    rec.attempts++;
    publish(rec);

    const ctx: JobHandlerContext = {
      jobId,
      attempt: rec.attempts,
      signal: abort.signal,
      reportProgress(p, note) {
        rec.progress = Math.max(0, Math.min(1, p));
        if (note !== undefined) rec.progressNote = note;
        publish(rec);
      },
    };

    try {
      const output = await handler(rec.input, ctx);
      if (abort.signal.aborted) {
        rec.state = "canceled";
      } else {
        rec.state = "succeeded";
        rec.output = output;
        rec.progress = 1;
      }
      rec.finishedAt = Date.now();
      publish(rec);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (abort.signal.aborted) {
        rec.state = "canceled";
        rec.finishedAt = Date.now();
        publish(rec);
      } else if (rec.attempts < rec.maxAttempts) {
        // Requeue after delay.
        rec.state = "queued";
        rec.error = message;
        publish(rec);
        const delay =
          (rec as JobRecord & { _retryDelay?: number })._retryDelay ?? 2000;
        setTimeout(() => {
          pending.push(jobId);
          pump();
        }, delay);
      } else {
        rec.state = "failed";
        rec.error = message;
        rec.finishedAt = Date.now();
        publish(rec);
      }
    } finally {
      aborts.delete(jobId);
      running--;
      pump();
    }
  }

  function pump() {
    while (running < concurrency && pending.length > 0) {
      const jobId = pending.shift()!;
      running++;
      // Fire without awaiting — parallelism.
      void runOne(jobId);
    }
  }

  return {
    progress,

    register(type, handler) {
      handlers.set(type, handler as JobHandler<any, any>);
    },

    async submit(type, input, submitOpts = {}) {
      const id = submitOpts.jobId ?? makeJobId();
      const rec: JobRecord = {
        id,
        type,
        state: "queued",
        input,
        submittedAt: Date.now(),
        attempts: 0,
        maxAttempts: submitOpts.maxAttempts ?? 1,
      };
      if (submitOpts.retryDelayMs !== undefined) {
        (rec as JobRecord & { _retryDelay?: number })._retryDelay =
          submitOpts.retryDelayMs;
      }
      jobs.set(id, rec);
      publish(rec);
      pending.push(id);
      pump();
      return id;
    },

    async getStatus(jobId) {
      return jobs.get(jobId) as JobRecord<unknown, any> | undefined;
    },

    async cancel(jobId) {
      const rec = jobs.get(jobId);
      if (!rec) return false;
      if (rec.state === "succeeded" || rec.state === "failed" || rec.state === "canceled") {
        return false;
      }
      const abort = aborts.get(jobId);
      if (abort) abort.abort();
      // If still queued (no abort yet), mark as canceled directly.
      if (rec.state === "queued") {
        rec.state = "canceled";
        rec.finishedAt = Date.now();
        // Remove from pending queue.
        const idx = pending.indexOf(jobId);
        if (idx >= 0) pending.splice(idx, 1);
        publish(rec);
      }
      return true;
    },

    async waitFor(jobId, waitOpts = {}) {
      const rec = jobs.get(jobId);
      if (!rec) throw new Error(`Unknown jobId: ${jobId}`);

      if (isTerminal(rec.state)) {
        return rec as JobRecord<unknown, any>;
      }

      return new Promise<JobRecord<unknown, any>>((resolve, reject) => {
        const timeoutMs = waitOpts.timeoutMs ?? 15 * 60_000;
        const timer = setTimeout(() => {
          unsub();
          reject(new Error(`waitFor(${jobId}) timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        const unsub = progress.subscribe(jobId, (ev) => {
          if (isTerminal(ev.state)) {
            clearTimeout(timer);
            unsub();
            const final = jobs.get(jobId);
            if (!final) return reject(new Error("Job record vanished"));
            resolve(final as JobRecord<unknown, any>);
          }
        });
      });
    },
  };
}

function isTerminal(state: JobRecord["state"]): boolean {
  return state === "succeeded" || state === "failed" || state === "canceled";
}
