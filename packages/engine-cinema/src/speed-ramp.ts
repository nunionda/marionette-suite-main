/**
 * Speed ramp presets — Higgsfield Cinema Studio 3.5 exposes 8.
 *
 * Each preset maps to:
 *
 *   - label + description    → UI dropdown
 *   - promptFragment         → natural-language hint for providers that
 *                              don't structure ramps (Kling, Hunyuan, Wan, LTX)
 *   - providerHints          → vendor-native pass-through (Seedance 2.0
 *                              exposes fields like `ramp_curve`, `motion_speed`)
 *
 * Same two-path model as camera-registry: structured where possible,
 * prompt fragment everywhere else. Keeps the orchestrator's render step
 * symmetric.
 */
import type { SpeedRampPreset } from "@marionette/ai-providers/video";

export interface SpeedRampDef {
  id: SpeedRampPreset;
  label: string;
  description: string;
  promptFragment: string;
  /** Provider-specific fields merged into VideoGenerateRequest.providerHints. */
  providerHints: Record<string, unknown>;
}

export const SPEED_RAMP_PRESETS: Record<SpeedRampPreset, SpeedRampDef> = {
  linear: {
    id: "linear",
    label: "Linear",
    description: "Constant real-time playback — no ramp",
    promptFragment: "",
    providerHints: { ramp_curve: "linear", motion_speed: 1.0 },
  },
  auto: {
    id: "auto",
    label: "Auto",
    description: "Provider chooses a natural ramp for the action",
    promptFragment: "",
    providerHints: { ramp_curve: "auto" },
  },
  "flash-in": {
    id: "flash-in",
    label: "Flash In",
    description: "Start fast, land in normal speed",
    promptFragment: "time ramp: rapid flash-in, resolves to natural speed",
    providerHints: { ramp_curve: "ease-out", motion_speed: 2.5 },
  },
  "flash-out": {
    id: "flash-out",
    label: "Flash Out",
    description: "Start normal, accelerate out into blur",
    promptFragment: "time ramp: normal speed accelerating into a flash-out",
    providerHints: { ramp_curve: "ease-in", motion_speed: 2.5 },
  },
  "slow-mo": {
    id: "slow-mo",
    label: "Slow Motion",
    description: "Sustained ~4x slow motion",
    promptFragment: "time ramp: sustained slow motion, 4x slower than real-time",
    providerHints: { ramp_curve: "linear", motion_speed: 0.25 },
  },
  "bullet-time": {
    id: "bullet-time",
    label: "Bullet Time",
    description: "Extreme slow-motion with orbiting camera emphasis",
    promptFragment: "bullet-time effect, extreme slow motion with dramatic camera orbit",
    providerHints: { ramp_curve: "hold", motion_speed: 0.1 },
  },
  impact: {
    id: "impact",
    label: "Impact",
    description: "Fast to slow on a hit moment — action cinema classic",
    promptFragment: "time ramp: fast approach collapsing into slow-motion impact moment",
    providerHints: { ramp_curve: "impact", motion_speed: 0.5, hold_frames: 8 },
  },
  "ramp-up": {
    id: "ramp-up",
    label: "Ramp Up",
    description: "Gradual acceleration across the whole shot",
    promptFragment: "time ramp: gradual speed ramp up from normal to fast",
    providerHints: { ramp_curve: "ease-in", motion_speed: 1.6 },
  },
};

export const SPEED_RAMP_LIST: SpeedRampDef[] = Object.values(SPEED_RAMP_PRESETS);

export function speedRampPromptFragment(preset?: SpeedRampPreset): string {
  if (!preset) return "";
  return SPEED_RAMP_PRESETS[preset].promptFragment;
}

export function speedRampProviderHints(
  preset?: SpeedRampPreset,
): Record<string, unknown> {
  if (!preset) return {};
  return { ...SPEED_RAMP_PRESETS[preset].providerHints };
}
