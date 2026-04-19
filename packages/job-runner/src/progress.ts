/**
 * Progress bus — lightweight in-process pub/sub for job progress events.
 *
 * The Hub's WebSocket route subscribes; workers publish. We intentionally
 * do NOT couple to a specific transport here — a future Redis pub/sub
 * impl can swap in behind the same `ProgressBus` interface.
 */

export interface ProgressEvent {
  jobId: string;
  state: "queued" | "running" | "succeeded" | "failed" | "canceled";
  progress?: number;
  note?: string;
  at: number;
  /** Present on terminal states. */
  error?: string;
}

export type ProgressListener = (ev: ProgressEvent) => void;

export interface ProgressBus {
  publish(ev: ProgressEvent): void;
  /** Returns an unsubscribe fn. */
  subscribe(jobId: string, listener: ProgressListener): () => void;
  /** Subscribe to ALL events — used by WebSocket broadcasters. */
  subscribeAll(listener: ProgressListener): () => void;
}

export function createInMemoryProgressBus(): ProgressBus {
  const perJob = new Map<string, Set<ProgressListener>>();
  const all = new Set<ProgressListener>();

  return {
    publish(ev) {
      const set = perJob.get(ev.jobId);
      if (set) {
        for (const l of set) {
          try {
            l(ev);
          } catch {
            // Listener errors must not break the publisher.
          }
        }
      }
      for (const l of all) {
        try {
          l(ev);
        } catch {
          // noop
        }
      }
    },
    subscribe(jobId, listener) {
      let set = perJob.get(jobId);
      if (!set) {
        set = new Set();
        perJob.set(jobId, set);
      }
      set.add(listener);
      return () => {
        set!.delete(listener);
        if (set!.size === 0) perJob.delete(jobId);
      };
    },
    subscribeAll(listener) {
      all.add(listener);
      return () => {
        all.delete(listener);
      };
    },
  };
}
