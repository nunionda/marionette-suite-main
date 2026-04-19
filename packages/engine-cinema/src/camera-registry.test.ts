import { describe, expect, it } from "vitest";
import {
  CAMERA_PRESETS,
  CAMERA_PRESET_LIST,
  applyCameraPreset,
  cameraPromptFragment,
} from "./camera-registry";

describe("camera registry", () => {
  it("ships exactly 8 presets", () => {
    expect(CAMERA_PRESET_LIST).toHaveLength(8);
  });

  it("every preset is indexed by its own id", () => {
    for (const p of CAMERA_PRESET_LIST) {
      expect(CAMERA_PRESETS[p.id].id).toBe(p.id);
    }
  });

  it("applyCameraPreset fills defaults when body is set", () => {
    const result = applyCameraPreset({ body: "arri-alexa" });
    expect(result).toEqual({
      body: "arri-alexa",
      focalMm: 35,
      aperture: 2.8,
      aspectRatio: "16:9",
    });
  });

  it("applyCameraPreset preserves explicit overrides", () => {
    const result = applyCameraPreset({
      body: "sony-venice",
      focalMm: 85,
      aperture: 1.4,
      aspectRatio: "21:9",
    });
    expect(result?.focalMm).toBe(85);
    expect(result?.aperture).toBe(1.4);
    expect(result?.aspectRatio).toBe("21:9");
  });

  it("applyCameraPreset returns undefined when body unset", () => {
    expect(applyCameraPreset()).toBeUndefined();
    expect(applyCameraPreset({})).toBeUndefined();
  });

  it("cameraPromptFragment composes body + lens + aperture", () => {
    const frag = cameraPromptFragment({
      body: "arri-alexa",
      focalMm: 50,
      aperture: 1.8,
    });
    expect(frag).toContain("ARRI Alexa 35");
    expect(frag).toContain("50mm lens");
    expect(frag).toContain("f/1.8");
  });

  it("cameraPromptFragment empty for unspecified body", () => {
    expect(cameraPromptFragment({ body: "unspecified" })).toBe("");
    expect(cameraPromptFragment()).toBe("");
  });
});
