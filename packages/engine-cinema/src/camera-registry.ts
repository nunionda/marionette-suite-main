/**
 * Camera registry — industry body presets with default lens tables.
 *
 * Mirrors Higgsfield Cinema Studio 3.5's "CameraSim" dropdown: pick a body,
 * inherit a sensible default lens + aperture, optionally override per shot.
 *
 * Two consumption paths:
 *
 *   1. Structured fields  → CameraSim { body, focalMm, aperture } passed to
 *                           providers that parse cinematography (Seedance 2.0).
 *   2. Prompt fragment    → natural-language snippet joined into the text
 *                           prompt for providers without structured cam
 *                           fields (Kling, Hunyuan, LTX, Wan).
 *
 * Keeping both paths inside the registry means the orchestrator renders once,
 * and the UI switcher doesn't have to duplicate lens knowledge per vendor.
 */
import type { CameraBody, CameraSim } from "@marionette/ai-providers/video";

export interface CameraPreset {
  id: CameraBody;
  label: string;
  /** Tagline shown in the Cinema Studio picker. */
  description: string;
  /** Default focal length if the user doesn't override. */
  defaultFocalMm: number;
  /** Default aperture. */
  defaultAperture: number;
  /**
   * Sensor footprint — descriptive only; drives prompt fragment.
   * Options: "S35" (Super 35mm), "FF" (full frame), "M43" (Micro 4/3),
   * "APS-C", "large-format", "mobile".
   */
  sensor: "S35" | "FF" | "M43" | "APS-C" | "large-format" | "mobile";
  /** Short natural-language snippet joined into the prompt. */
  promptFragment: string;
}

/**
 * The 8 presets we ship. Intentionally small — most productions only ever
 * reach for 3-4 of these. Add more as operator feedback demands.
 */
export const CAMERA_PRESETS: Record<CameraBody, CameraPreset> = {
  "arri-alexa": {
    id: "arri-alexa",
    label: "ARRI Alexa 35",
    description: "Flagship cinema — creamy highlight rolloff, 4.6K S35",
    defaultFocalMm: 35,
    defaultAperture: 2.8,
    sensor: "S35",
    promptFragment:
      "shot on ARRI Alexa 35, anamorphic rendering, creamy filmic highlights",
  },
  "red-komodo": {
    id: "red-komodo",
    label: "RED V-Raptor / Komodo",
    description: "Sharp modern digital, 8K, popular for VFX-heavy work",
    defaultFocalMm: 50,
    defaultAperture: 2.8,
    sensor: "S35",
    promptFragment:
      "shot on RED Komodo, razor-sharp 8K clarity, neutral color science",
  },
  "sony-venice": {
    id: "sony-venice",
    label: "Sony Venice 2",
    description: "Full-frame cinema — low-light champion, high-end streaming",
    defaultFocalMm: 35,
    defaultAperture: 2.0,
    sensor: "FF",
    promptFragment:
      "shot on Sony Venice 2, full-frame clarity, warm skin tones, shallow depth",
  },
  "blackmagic-ursa": {
    id: "blackmagic-ursa",
    label: "Blackmagic URSA Cine",
    description: "Indie-cinema workhorse, 12K large format",
    defaultFocalMm: 35,
    defaultAperture: 4.0,
    sensor: "large-format",
    promptFragment:
      "shot on Blackmagic URSA Cine, 12K large format, rich dynamic range",
  },
  "canon-c500": {
    id: "canon-c500",
    label: "Canon C500 Mk II",
    description: "Broadcast / documentary — fast workflow, natural color",
    defaultFocalMm: 50,
    defaultAperture: 2.8,
    sensor: "FF",
    promptFragment:
      "shot on Canon C500 Mk II, natural broadcast color, warm highlights",
  },
  "phantom-flex": {
    id: "phantom-flex",
    label: "Phantom Flex 4K",
    description: "Ultra high-speed — 1000fps slow motion",
    defaultFocalMm: 85,
    defaultAperture: 2.8,
    sensor: "S35",
    promptFragment:
      "shot on Phantom Flex at 1000fps, hyper slow motion, crisp high-speed motion",
  },
  "iphone-pro": {
    id: "iphone-pro",
    label: "iPhone Pro (UGC)",
    description: "Mobile-style vertical / social — natural handheld feel",
    defaultFocalMm: 26,
    defaultAperture: 1.8,
    sensor: "mobile",
    promptFragment:
      "shot on iPhone, mobile vertical aesthetic, natural handheld wobble, slight rolling shutter",
  },
  unspecified: {
    id: "unspecified",
    label: "Unspecified",
    description: "No body hint — provider picks its own look",
    defaultFocalMm: 35,
    defaultAperture: 2.8,
    sensor: "S35",
    promptFragment: "",
  },
};

/** Array form for UI lists. */
export const CAMERA_PRESET_LIST: CameraPreset[] = Object.values(CAMERA_PRESETS);

/**
 * Fill in defaults from the preset when fields are missing. Used by the
 * orchestrator before forwarding `camera` to the provider.
 */
export function applyCameraPreset(input?: CameraSim): Required<CameraSim> | undefined {
  if (!input?.body) return undefined;
  const preset = CAMERA_PRESETS[input.body];
  return {
    body: input.body,
    focalMm: input.focalMm ?? preset.defaultFocalMm,
    aperture: input.aperture ?? preset.defaultAperture,
    aspectRatio: input.aspectRatio ?? "16:9",
  };
}

/**
 * Produce a natural-language prompt fragment for providers that don't honor
 * structured camera fields. Empty string when no body selected.
 */
export function cameraPromptFragment(input?: CameraSim): string {
  if (!input?.body) return "";
  const base = CAMERA_PRESETS[input.body].promptFragment;
  if (!base) return "";

  const parts = [base];
  if (input.focalMm) parts.push(`${input.focalMm}mm lens`);
  if (input.aperture) parts.push(`f/${input.aperture.toFixed(1)}`);
  return parts.join(", ");
}
