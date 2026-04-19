/**
 * Cinema engine composition root — singletons live here.
 *
 * Next.js 15 App Router route handlers run per-request, but Node's module
 * cache persists across requests in the same worker. That's enough to
 * treat the in-memory store + queue as process-scoped singletons for the
 * demo. Production swaps these for Drizzle+Postgres / BullMQ+Redis at the
 * same import boundary without touching callers (plan B.8).
 */
import "server-only";

import {
  createInMemoryElementStore,
  type ElementStore,
} from "@marionette/elements-core";
import {
  createCinemaOrchestrator,
  type CinemaOrchestrator,
} from "@marionette/engine-cinema";
import {
  createInMemoryJobQueue,
  type JobQueue,
} from "@marionette/job-runner";
import { resolveVideoProvider } from "@marionette/ai-providers/registry";

interface EngineRegistry {
  store: ElementStore;
  queue: JobQueue;
  cinema: CinemaOrchestrator;
}

declare global {
  // Preserve singletons across HMR reloads in dev. The `@ts-expect-error`
  // pattern is a common Next.js idiom — typing a global requires either
  // declaration-merging or a best-effort cast.
  // eslint-disable-next-line no-var
  var __marionetteCinema: EngineRegistry | undefined;
}

function build(): EngineRegistry {
  const store = createInMemoryElementStore();
  const queue = createInMemoryJobQueue({ concurrency: 2 });
  const cinema = createCinemaOrchestrator({
    store,
    resolveProvider: (prefer) => resolveVideoProvider(prefer),
  });

  // Register the cinema job handler.
  queue.register<
    {
      sceneId?: string;
      shotId?: string;
      prompt: string;
      elementIds?: string[];
      cameraBody?: string;
      motion?: string;
      ramp?: string;
      aspectRatio?: string;
      durationSec?: number;
      preferProvider?: string;
    },
    {
      providerId: string;
      nodeId: string;
      videoUrl?: string;
    }
  >("cinema:shot", async (input, ctx) => {
    ctx.reportProgress(0.05, "resolving provider");
    const { result, providerId, nodeId } = await cinema.generateShot({
      sceneId: input.sceneId,
      shotId: input.shotId,
      prompt: input.prompt,
      elementIds: input.elementIds,
      camera: input.cameraBody
        ? ({ body: input.cameraBody as any, aspectRatio: input.aspectRatio as any })
        : undefined,
      motionStack: input.motion
        ? [{ type: input.motion as any }]
        : undefined,
      speedRamp: input.ramp as any,
      durationSec: input.durationSec,
      preferProvider: input.preferProvider,
    });
    ctx.reportProgress(0.95, "finalizing");
    const video = result.videos[0];
    return {
      providerId,
      nodeId,
      videoUrl: video?.kind === "url" ? video.url : undefined,
    };
  });

  return { store, queue, cinema };
}

export function getCinemaEngine(): EngineRegistry {
  if (!globalThis.__marionetteCinema) {
    globalThis.__marionetteCinema = build();
  }
  return globalThis.__marionetteCinema;
}
