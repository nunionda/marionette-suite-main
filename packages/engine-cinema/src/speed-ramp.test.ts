import { describe, expect, it } from "vitest";
import {
  SPEED_RAMP_LIST,
  SPEED_RAMP_PRESETS,
  speedRampPromptFragment,
  speedRampProviderHints,
} from "./speed-ramp";

describe("speed-ramp presets", () => {
  it("ships exactly 8 presets (Higgsfield parity)", () => {
    expect(SPEED_RAMP_LIST).toHaveLength(8);
  });

  it("every preset indexed by its own id", () => {
    for (const p of SPEED_RAMP_LIST) {
      expect(SPEED_RAMP_PRESETS[p.id].id).toBe(p.id);
    }
  });

  it("linear + auto produce empty prompt fragments (no-op)", () => {
    expect(speedRampPromptFragment("linear")).toBe("");
    expect(speedRampPromptFragment("auto")).toBe("");
  });

  it("impact emits distinctive prompt + hints", () => {
    const frag = speedRampPromptFragment("impact");
    expect(frag).toMatch(/impact/i);
    const hints = speedRampProviderHints("impact");
    expect(hints.ramp_curve).toBe("impact");
    expect(hints.motion_speed).toBe(0.5);
  });

  it("undefined preset returns empty fragment + empty hints", () => {
    expect(speedRampPromptFragment(undefined)).toBe("");
    expect(speedRampProviderHints(undefined)).toEqual({});
  });

  it("returned hints are copies (mutation-safe)", () => {
    const h = speedRampProviderHints("slow-mo");
    h.motion_speed = 999;
    expect(SPEED_RAMP_PRESETS["slow-mo"].providerHints.motion_speed).toBe(0.25);
  });
});
