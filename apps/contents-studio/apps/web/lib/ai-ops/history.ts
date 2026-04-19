/**
 * Ai-Ops event history — rolling buffer of the last 100 progress events
 * across all job types.
 *
 * We accumulate on the singleton progress bus via `subscribeAll`. This is
 * the simplest way to give the /ai-ops dashboard something to show
 * without teaching the JobQueue interface to enumerate — which would
 * bloat the Layer-1 package for a feature that's purely dashboard-scope.
 *
 * When the queue swaps to BullMQ+Redis in a future sprint, the same
 * subscription pattern works because the bus is a separate interface.
 */
import "server-only";

import type { ProgressEvent } from "@marionette/job-runner";
import { getCinemaEngine } from "../cinema/engine";

const MAX_EVENTS = 100;

interface HistoryRegistry {
  log: ProgressEvent[];
}

declare global {
  // eslint-disable-next-line no-var
  var __marionetteAiOpsHistory: HistoryRegistry | undefined;
}

function build(): HistoryRegistry {
  const log: ProgressEvent[] = [];
  const { queue } = getCinemaEngine();

  queue.progress.subscribeAll((ev) => {
    log.push(ev);
    if (log.length > MAX_EVENTS) log.splice(0, log.length - MAX_EVENTS);
  });

  return { log };
}

export function getAiOpsHistory(): ProgressEvent[] {
  if (!globalThis.__marionetteAiOpsHistory) {
    globalThis.__marionetteAiOpsHistory = build();
  }
  // Return a copy so callers can't mutate the buffer.
  return [...globalThis.__marionetteAiOpsHistory.log];
}

/**
 * Per-jobId summary: latest event + terminal state + duration.
 * Used by /ai-ops to build the job table.
 */
export interface JobSummary {
  jobId: string;
  latestState: ProgressEvent["state"];
  latestProgress?: number;
  latestNote?: string;
  firstSeenAt: number;
  lastSeenAt: number;
  durationMs?: number;
  error?: string;
}

export function summarizeHistory(log: ProgressEvent[]): JobSummary[] {
  const byJob = new Map<string, JobSummary>();
  for (const ev of log) {
    const existing = byJob.get(ev.jobId);
    if (!existing) {
      byJob.set(ev.jobId, {
        jobId: ev.jobId,
        latestState: ev.state,
        latestProgress: ev.progress,
        latestNote: ev.note,
        firstSeenAt: ev.at,
        lastSeenAt: ev.at,
        error: ev.error,
      });
    } else {
      existing.latestState = ev.state;
      existing.latestProgress = ev.progress;
      if (ev.note) existing.latestNote = ev.note;
      existing.lastSeenAt = ev.at;
      if (ev.error) existing.error = ev.error;
    }
  }
  for (const s of byJob.values()) {
    if (
      s.latestState === "succeeded" ||
      s.latestState === "failed" ||
      s.latestState === "canceled"
    ) {
      s.durationMs = s.lastSeenAt - s.firstSeenAt;
    }
  }
  // Newest first.
  return Array.from(byJob.values()).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}
