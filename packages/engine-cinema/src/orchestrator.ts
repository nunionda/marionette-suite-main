/**
 * CinemaOrchestrator — Layer 3 engine for Higgsfield Cinema Studio 3.5-style
 * shot generation.
 *
 * Input:  a ShotRequest naming the scene/shot + elements on camera + camera +
 *         motion stack + speed ramp + audio options.
 * Output: a VideoGenerateResult (URLs or bytes) plus a `usedIn` write back
 *         to each Element in the store.
 *
 * The orchestrator is the ONLY place that knows about Layer 1 providers AND
 * Layer 2 element store AND Layer 2.5 prompt-adapters. Engines above it
 * (Hub UI, job-runner) see just `generateShot()` / `submitShot()`.
 *
 * Composition pattern: the orchestrator is created with injected deps so
 * tests can pass a fake VideoProvider + in-memory ElementStore without
 * touching the real registry.
 */
import type {
  CameraSim,
  MotionAxis,
  SpeedRampPreset,
  VideoAudioOptions,
  VideoGenerateRequest,
  VideoGenerateResult,
  VideoProvider,
} from "@marionette/ai-providers/video";
import type { ImageAspectRatio } from "@marionette/ai-providers/image";
import type { ElementStore } from "@marionette/elements-core";
import { resolveVideoProvider } from "@marionette/ai-providers/registry";

import {
  applyCameraPreset,
  cameraPromptFragment,
} from "./camera-registry";
import {
  renderMotionStack,
  validateMotionStack,
} from "./motion-stack";
import {
  speedRampPromptFragment,
  speedRampProviderHints,
} from "./speed-ramp";
import {
  collectReferencesForElements,
  combinedSeed,
} from "./shot-sequence";

export interface ShotRequest {
  /** Scene + shot identifiers — written to Element.usedIn after success. */
  sceneId?: string;
  shotId?: string;
  /**
   * A stable node identifier. Default composed from sceneId+shotId, but the
   * Hub can set it explicitly so two engines referencing the same shot
   * share the same key.
   */
  nodeId?: string;

  /** Text prompt. Camera + motion + ramp fragments are appended automatically. */
  prompt: string;
  negativePrompt?: string;

  /**
   * Elements on camera. Their references and optional trained Soul IDs get
   * collected up to MAX_REFERENCES (9) and forwarded to the provider.
   */
  elementIds?: string[];

  camera?: CameraSim;
  motionStack?: MotionAxis[];
  speedRamp?: SpeedRampPreset;

  durationSec?: number;
  fps?: 24 | 30 | 60;
  quality?: "draft" | "final";
  aspectRatio?: ImageAspectRatio;
  audio?: VideoAudioOptions;

  /** Override the auto-derived seed (useful for iterating on one Element). */
  seed?: number;

  /** UI switcher override — "seedance-2.0" | "kling-3.0" | "hunyuan-hf" | ... */
  preferProvider?: string;

  /** Extra provider-specific pass-through merged last. */
  providerHints?: Record<string, unknown>;
}

export interface CinemaOrchestratorDeps {
  store: ElementStore;
  /** Injectable for tests. Omitted → uses registry.resolveVideoProvider(). */
  resolveProvider?: (prefer?: string) => Promise<VideoProvider>;
}

export interface CinemaOrchestrator {
  /** Build a provider-ready VideoGenerateRequest without sending it. */
  buildRequest(shot: ShotRequest): Promise<{
    request: VideoGenerateRequest;
    usedElementIds: string[];
    soulModelIds: string[];
    providerId: string;
    nodeId: string;
  }>;

  /** Submit to the provider and return a jobId. Records usedIn immediately. */
  submitShot(shot: ShotRequest): Promise<{
    jobId: string;
    providerId: string;
    nodeId: string;
  }>;

  /** End-to-end: submit + poll until done. */
  generateShot(
    shot: ShotRequest,
    opts?: { pollIntervalMs?: number; timeoutMs?: number },
  ): Promise<{ result: VideoGenerateResult; providerId: string; nodeId: string }>;
}

export function createCinemaOrchestrator(
  deps: CinemaOrchestratorDeps,
): CinemaOrchestrator {
  const resolveProvider =
    deps.resolveProvider ??
    ((prefer?: string) => resolveVideoProvider(prefer));

  async function prepare(shot: ShotRequest) {
    validateMotionStack(shot.motionStack);

    const collected = await collectReferencesForElements(
      deps.store,
      shot.elementIds ?? [],
    );

    // Compose prompt fragments — camera + motion + ramp hints.
    const promptFragments = [
      shot.prompt,
      cameraPromptFragment(shot.camera),
      renderMotionStack(shot.motionStack ?? []),
      speedRampPromptFragment(shot.speedRamp),
    ].filter(Boolean);

    // Soul IDs embed as hint text too — providers like Kling take string
    // modifiers; Seedance honors them structurally via providerHints.
    if (collected.soulModelIds.length) {
      promptFragments.push(
        `identity locks: ${collected.soulModelIds.join(", ")}`,
      );
    }

    const provider = await resolveProvider(shot.preferProvider);
    const providerId = provider.meta.id;

    const seed =
      shot.seed ?? combinedSeed(collected.usedElementIds);

    const request: VideoGenerateRequest = {
      prompt: promptFragments.join(". "),
      negativePrompt: shot.negativePrompt,
      references: collected.references,
      camera: applyCameraPreset(shot.camera) ?? shot.camera,
      motionStack: shot.motionStack,
      speedRamp: shot.speedRamp,
      durationSec: shot.durationSec,
      fps: shot.fps,
      quality: shot.quality,
      seed,
      audio: shot.audio,
      providerHints: {
        ...speedRampProviderHints(shot.speedRamp),
        ...(collected.soulModelIds.length
          ? { soulModelIds: collected.soulModelIds }
          : {}),
        ...shot.providerHints,
      },
    };

    // Aspect ratio lives on the camera slot in the provider shape, but we
    // accept it at the shot level too for ergonomics.
    if (shot.aspectRatio && request.camera) {
      request.camera = { ...request.camera, aspectRatio: shot.aspectRatio };
    } else if (shot.aspectRatio) {
      request.camera = { aspectRatio: shot.aspectRatio };
    }

    const nodeId =
      shot.nodeId ??
      [
        "cinema",
        shot.sceneId ?? "scene?",
        shot.shotId ?? "shot?",
      ].join(":");

    return {
      request,
      provider,
      providerId,
      collected,
      nodeId,
    };
  }

  async function recordUsage(
    shot: ShotRequest,
    usedElementIds: string[],
    nodeId: string,
  ) {
    await Promise.all(
      usedElementIds.map((elementId) =>
        deps.store.recordUsage(elementId, {
          nodeId,
          sceneId: shot.sceneId,
          shotId: shot.shotId,
          contextLabel: `cinema:${shot.preferProvider ?? "auto"}`,
        }),
      ),
    );
  }

  return {
    async buildRequest(shot) {
      const { request, providerId, collected, nodeId } = await prepare(shot);
      return {
        request,
        usedElementIds: collected.usedElementIds,
        soulModelIds: collected.soulModelIds,
        providerId,
        nodeId,
      };
    },

    async submitShot(shot) {
      const { request, provider, providerId, collected, nodeId } =
        await prepare(shot);
      const { jobId } = await provider.submit(request);
      // Record usage eagerly on submit — the shot *intent* is committed
      // even if generation fails. The store has no notion of "pending
      // usage" so this is a pragmatic compromise. If generation fails, the
      // operator can unsubscribe by removing the usage row.
      await recordUsage(shot, collected.usedElementIds, nodeId);
      return { jobId, providerId, nodeId };
    },

    async generateShot(shot, opts) {
      const { request, provider, providerId, collected, nodeId } =
        await prepare(shot);
      const result = await provider.generateBlocking(request, opts);
      await recordUsage(shot, collected.usedElementIds, nodeId);
      return { result, providerId, nodeId };
    },
  };
}
