/**
 * Job runner types — durable execution + progress events + storage.
 *
 * The Layer-1 video providers and the Layer-3 orchestrators already
 * know *what* to do; this package knows *how to run it reliably*:
 * persist input, retry on transient failures, emit progress, park the
 * result in durable storage.
 *
 * Interface-first: in-memory impl today, BullMQ+Redis drop-in tomorrow.
 * See plan B.8 "승인 필요 결정 — Job queue: BullMQ+Redis (Recommended)".
 */

export type JobState =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled";

export interface JobRecord<Input = unknown, Output = unknown> {
  id: string;
  type: string;
  state: JobState;
  input: Input;
  output?: Output;
  error?: string;
  /** 0..1 progress set by handlers via reportProgress(). */
  progress?: number;
  progressNote?: string;
  /** Unix ms. */
  submittedAt: number;
  startedAt?: number;
  finishedAt?: number;
  /** How many times the handler has been tried so far (including current run). */
  attempts: number;
  maxAttempts: number;
}

/** Functions a handler receives for reporting progress and checking cancel. */
export interface JobHandlerContext {
  readonly jobId: string;
  readonly attempt: number;
  /** AbortSignal triggered when the job is canceled. */
  readonly signal: AbortSignal;
  /** Report progress (0..1 + optional note). */
  reportProgress(progress: number, note?: string): void;
}

export type JobHandler<Input, Output> = (
  input: Input,
  ctx: JobHandlerContext,
) => Promise<Output>;

export interface SubmitOptions {
  /** Max attempts. Default 1 (no retry). */
  maxAttempts?: number;
  /** Delay between attempts (ms). Default 2000. */
  retryDelayMs?: number;
  /** Custom jobId — defaults to auto-generated. */
  jobId?: string;
}
