/**
 * Ad style registry — 9 creative treatments the Marketing Studio exposes.
 *
 * Mirrors Higgsfield Marketing Studio's style grid. Each style is a bundle
 * of (prompt modifiers, default motion hints, default camera) that tells the
 * video provider what "kind of ad" to make.
 *
 * Consumed by MarketingOrchestrator the same way cinema consumes
 * camera-registry: structured fields where supported, prompt fragment for
 * everyone else.
 */
import type {
  CameraBody,
  MotionAxis,
} from "@marionette/ai-providers/video";

export type AdStyleId =
  | "ugc"
  | "unboxing"
  | "review"
  | "studio-product"
  | "lifestyle"
  | "testimonial"
  | "tutorial"
  | "cinematic-spot"
  | "comparison";

export interface AdStyleDef {
  id: AdStyleId;
  label: string;
  description: string;
  /** Short natural-language hint joined into the prompt. */
  promptFragment: string;
  /** Sensible default motion for this style (operator may override). */
  defaultMotion?: MotionAxis[];
  /** Sensible default camera body. */
  defaultCameraBody?: CameraBody;
  /** Typical duration range the style works best in. */
  durationRangeSec: readonly [number, number];
  /** Typical speed-ramp hint — not all styles want a ramp. */
  suggestsRamp?:
    | "linear"
    | "auto"
    | "flash-in"
    | "flash-out"
    | "slow-mo"
    | "bullet-time"
    | "impact"
    | "ramp-up";
}

export const AD_STYLES: Record<AdStyleId, AdStyleDef> = {
  ugc: {
    id: "ugc",
    label: "UGC (User-Generated)",
    description: "Handheld, vertical, authentic — like a TikTok creator shot it",
    promptFragment:
      "user-generated-content style, handheld vertical selfie video, natural lighting, authentic unpolished feel",
    defaultMotion: [{ type: "handheld", intensity: 0.4 }],
    defaultCameraBody: "iphone-pro",
    durationRangeSec: [8, 30],
    suggestsRamp: "auto",
  },
  unboxing: {
    id: "unboxing",
    label: "Unboxing",
    description: "Overhead hands-on reveal, satisfying product surfaces",
    promptFragment:
      "overhead unboxing shot, hands opening a package, tactile product reveal, clean surfaces",
    defaultMotion: [
      { type: "tilt", direction: "down", intensity: 0.3 },
      { type: "push-in", intensity: 0.4 },
    ],
    defaultCameraBody: "iphone-pro",
    durationRangeSec: [10, 30],
    suggestsRamp: "auto",
  },
  review: {
    id: "review",
    label: "Product Review",
    description: "Talking head + product cutaways, trustworthy and informational",
    promptFragment:
      "product review style, talking head framing with B-roll cutaways of the product, natural voice",
    defaultCameraBody: "sony-venice",
    durationRangeSec: [20, 60],
    suggestsRamp: "linear",
  },
  "studio-product": {
    id: "studio-product",
    label: "Studio Product Shot",
    description: "Clean turntable / gradient backdrop, premium feel",
    promptFragment:
      "studio product photography, clean gradient backdrop, controlled studio lighting, luxury premium feel",
    defaultMotion: [{ type: "orbit", direction: "cw", intensity: 0.5 }],
    defaultCameraBody: "arri-alexa",
    durationRangeSec: [5, 15],
    suggestsRamp: "linear",
  },
  lifestyle: {
    id: "lifestyle",
    label: "Lifestyle Vignette",
    description: "Aspirational scenes showing the product in daily life",
    promptFragment:
      "lifestyle advertising, aspirational daily moments, soft warm light, shallow depth of field",
    defaultMotion: [{ type: "dolly", direction: "in", intensity: 0.4 }],
    defaultCameraBody: "sony-venice",
    durationRangeSec: [15, 45],
    suggestsRamp: "auto",
  },
  testimonial: {
    id: "testimonial",
    label: "Testimonial",
    description: "Real customer voice, face-to-camera interview framing",
    promptFragment:
      "testimonial interview, real customer speaking to camera, warm emotion, authentic background",
    defaultCameraBody: "canon-c500",
    durationRangeSec: [15, 45],
    suggestsRamp: "linear",
  },
  tutorial: {
    id: "tutorial",
    label: "Tutorial / How-to",
    description: "Step-by-step demo with overlay graphics friendly framing",
    promptFragment:
      "step-by-step tutorial, clear demonstration shots, space for text overlays, didactic framing",
    defaultCameraBody: "canon-c500",
    durationRangeSec: [20, 60],
    suggestsRamp: "linear",
  },
  "cinematic-spot": {
    id: "cinematic-spot",
    label: "Cinematic Spot",
    description: "TV-commercial feel — full production value, dramatic",
    promptFragment:
      "cinematic advertising spot, dramatic lighting, anamorphic flares, epic commercial energy",
    defaultMotion: [{ type: "crane", direction: "down", intensity: 0.6 }],
    defaultCameraBody: "arri-alexa",
    durationRangeSec: [15, 60],
    suggestsRamp: "impact",
  },
  comparison: {
    id: "comparison",
    label: "Comparison (Before / After)",
    description: "Split-screen or sequential reveal showing transformation",
    promptFragment:
      "before-and-after comparison, split-screen transformation, clean visual contrast",
    defaultCameraBody: "sony-venice",
    durationRangeSec: [10, 30],
    suggestsRamp: "flash-in",
  },
};

export const AD_STYLE_LIST: AdStyleDef[] = Object.values(AD_STYLES);
