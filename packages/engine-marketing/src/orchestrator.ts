/**
 * MarketingOrchestrator — Layer 3 engine for Higgsfield Marketing Studio.
 *
 * Input:  a MarketingBriefRequest (product + optional avatar element +
 *         style + platform + variants count).
 * Output: N `VideoGenerateResult` variants, one per platform/style combo.
 *
 * Flow:
 *   product brief  →  build prompt from style + product attributes
 *   avatar element →  inject references + Soul ID like cinema does
 *   platform spec  →  set aspect + duration + fps
 *   style defaults →  camera body + motion stack + ramp hint
 *
 * We reuse `CinemaOrchestrator` under the hood — marketing is just a
 * different *style* of cinema shot with specific platform constraints.
 * Instead of re-implementing camera/motion/ramp mapping, we build a
 * `ShotRequest` and delegate. This also means marketing inherits the
 * same usedIn bookkeeping for free.
 */
import type {
  CinemaOrchestrator,
  ShotRequest,
} from "@marionette/engine-cinema";
import type {
  VideoGenerateResult,
} from "@marionette/ai-providers/video";
import { AD_STYLES, type AdStyleId } from "./ad-style-registry";
import {
  PLATFORM_SPECS,
  clampDuration,
  type MarketingPlatform,
} from "./platform-publisher";
import type { ProductBrief } from "./product-extractor";

export interface MarketingBriefRequest {
  product: ProductBrief;
  /** Optional — pre-created via buildAvatarElement(). */
  avatarElementId?: string;
  /** Optional — arbitrary extra elements (props, sets, etc). */
  extraElementIds?: string[];
  style: AdStyleId;
  platform: MarketingPlatform;
  /** 1..4 variant count — marketing UIs love A/B/C/D testing. Default 1. */
  variants?: number;
  /** Override recommended duration — clamped by platform max. */
  durationSec?: number;
  /** UI provider switcher override. */
  preferProvider?: string;
  /** Free-form additional prompt clause (campaign CTA, tone, etc). */
  extraPrompt?: string;
  /** Optional explicit seed — otherwise derived deterministically. */
  seed?: number;
}

export interface MarketingVariant {
  variantIndex: number;
  platform: MarketingPlatform;
  style: AdStyleId;
  result: VideoGenerateResult;
  providerId: string;
  nodeId: string;
}

export interface MarketingOrchestrator {
  /** Build the derived ShotRequest(s) without submitting — UI preview. */
  plan(req: MarketingBriefRequest): ShotRequest[];
  /** Submit N variants sequentially, return each result when done. */
  generateCampaign(
    req: MarketingBriefRequest,
    opts?: { pollIntervalMs?: number; timeoutMs?: number },
  ): Promise<MarketingVariant[]>;
}

/** Compose a prompt string from product + style + extraPrompt. */
export function composeMarketingPrompt(
  product: ProductBrief,
  style: AdStyleId,
  extraPrompt?: string,
): string {
  const styleDef = AD_STYLES[style];
  const parts: string[] = [];
  if (product.name) parts.push(`featuring ${product.name}`);
  if (product.description) parts.push(product.description);
  parts.push(styleDef.promptFragment);
  if (product.attributes) {
    const attrs = Object.entries(product.attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    if (attrs) parts.push(attrs);
  }
  if (extraPrompt) parts.push(extraPrompt);
  return parts.filter(Boolean).join(". ");
}

export function createMarketingOrchestrator(
  cinema: CinemaOrchestrator,
): MarketingOrchestrator {
  function toShotRequests(req: MarketingBriefRequest): ShotRequest[] {
    const style = AD_STYLES[req.style];
    const platform = PLATFORM_SPECS[req.platform];
    const variants = Math.max(1, Math.min(4, req.variants ?? 1));
    const prompt = composeMarketingPrompt(
      req.product,
      req.style,
      req.extraPrompt,
    );
    const duration = clampDuration(
      req.platform,
      req.durationSec ?? platform.recommendedDurationSec,
    );

    const elementIds: string[] = [];
    if (req.avatarElementId) elementIds.push(req.avatarElementId);
    if (req.extraElementIds) elementIds.push(...req.extraElementIds);

    const baseShot: ShotRequest = {
      prompt,
      elementIds,
      camera: { body: style.defaultCameraBody },
      motionStack: style.defaultMotion,
      speedRamp: style.suggestsRamp,
      durationSec: duration,
      fps: platform.fps,
      aspectRatio: platform.aspectRatio,
      quality: "final",
      seed: req.seed,
      preferProvider: req.preferProvider,
      audio: { native: true, include: ["music"] },
      nodeId: `marketing:${req.platform}:${req.style}`,
    };

    return Array.from({ length: variants }, (_, i) => ({
      ...baseShot,
      // Per-variant seed differentiation so the provider returns different
      // outputs. If the operator set an explicit seed, derive from it.
      seed:
        req.seed !== undefined ? req.seed + i * 7919 : undefined,
      nodeId: `${baseShot.nodeId}:v${i + 1}`,
    }));
  }

  return {
    plan(req) {
      return toShotRequests(req);
    },

    async generateCampaign(req, opts) {
      const shots = toShotRequests(req);
      const out: MarketingVariant[] = [];
      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i]!;
        const { result, providerId, nodeId } = await cinema.generateShot(
          shot,
          opts,
        );
        out.push({
          variantIndex: i,
          platform: req.platform,
          style: req.style,
          result,
          providerId,
          nodeId,
        });
      }
      return out;
    },
  };
}
