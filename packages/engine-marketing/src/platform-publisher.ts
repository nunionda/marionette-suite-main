/**
 * Platform publisher — aspect + duration + framing constraints per target.
 *
 * Marketing output has to **fit the platform's specification**. YouTube
 * Shorts, TikTok, IG Reels, X, LinkedIn all have different aspect ratios,
 * max durations, and framing affordances (caption-safe zones, end-card
 * timing). Encoding these as first-class constraints lets the orchestrator
 * pick fps/duration/aspect without duplicating logic per caller.
 *
 * This layer does NOT publish — it produces a **platform spec** that the
 * orchestrator reads when building the VideoGenerateRequest. Actual
 * publishing (OAuth'd upload to IG/TikTok/YT/X APIs) is a future sprint.
 */
import type { ImageAspectRatio } from "@marionette/ai-providers/image";

export type MarketingPlatform =
  | "instagram-reel"
  | "instagram-feed"
  | "tiktok"
  | "youtube-shorts"
  | "youtube-16x9"
  | "x-twitter"
  | "linkedin"
  | "generic-vertical"
  | "generic-horizontal";

export interface PlatformSpec {
  id: MarketingPlatform;
  label: string;
  aspectRatio: ImageAspectRatio;
  /** Hard upper bound in seconds — provider output will be clamped. */
  maxDurationSec: number;
  /** Sweet-spot duration to target by default. */
  recommendedDurationSec: number;
  /** Frames-per-second the platform prefers. */
  fps: 24 | 30 | 60;
  /** Notes about framing — e.g. "caption-safe zone bottom 20%". */
  framingNotes?: string;
}

export const PLATFORM_SPECS: Record<MarketingPlatform, PlatformSpec> = {
  "instagram-reel": {
    id: "instagram-reel",
    label: "Instagram Reel",
    aspectRatio: "9:16",
    maxDurationSec: 90,
    recommendedDurationSec: 15,
    fps: 30,
    framingNotes: "caption-safe zone: top 15% (profile), bottom 20% (UI)",
  },
  "instagram-feed": {
    id: "instagram-feed",
    label: "Instagram Feed",
    aspectRatio: "1:1",
    maxDurationSec: 60,
    recommendedDurationSec: 15,
    fps: 30,
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    aspectRatio: "9:16",
    maxDurationSec: 180,
    recommendedDurationSec: 21,
    fps: 30,
    framingNotes: "caption-safe zone: bottom 25% (UI + creator handle)",
  },
  "youtube-shorts": {
    id: "youtube-shorts",
    label: "YouTube Shorts",
    aspectRatio: "9:16",
    maxDurationSec: 60,
    recommendedDurationSec: 30,
    fps: 30,
    framingNotes: "caption-safe zone: bottom 15%",
  },
  "youtube-16x9": {
    id: "youtube-16x9",
    label: "YouTube (Standard)",
    aspectRatio: "16:9",
    maxDurationSec: 600,
    recommendedDurationSec: 30,
    fps: 30,
  },
  "x-twitter": {
    id: "x-twitter",
    label: "X / Twitter",
    aspectRatio: "16:9",
    maxDurationSec: 140,
    recommendedDurationSec: 20,
    fps: 30,
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    aspectRatio: "16:9",
    maxDurationSec: 600,
    recommendedDurationSec: 60,
    fps: 30,
  },
  "generic-vertical": {
    id: "generic-vertical",
    label: "Generic Vertical",
    aspectRatio: "9:16",
    maxDurationSec: 120,
    recommendedDurationSec: 20,
    fps: 30,
  },
  "generic-horizontal": {
    id: "generic-horizontal",
    label: "Generic Horizontal",
    aspectRatio: "16:9",
    maxDurationSec: 120,
    recommendedDurationSec: 20,
    fps: 30,
  },
};

export const PLATFORM_LIST: PlatformSpec[] = Object.values(PLATFORM_SPECS);

/** Clamp a desired duration to the platform's max. */
export function clampDuration(
  platform: MarketingPlatform,
  durationSec: number,
): number {
  const spec = PLATFORM_SPECS[platform];
  return Math.min(durationSec, spec.maxDurationSec);
}
