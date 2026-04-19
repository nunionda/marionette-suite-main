import { describe, expect, it } from "vitest";
import {
  MAX_MOTION_AXES,
  MotionStackOverflowError,
  motion,
  renderAxis,
  renderMotionStack,
  validateMotionStack,
} from "./motion-stack";

describe("motion stack", () => {
  it("cap is 3", () => {
    expect(MAX_MOTION_AXES).toBe(3);
  });

  it("validateMotionStack accepts empty and 1..3 axes", () => {
    expect(() => validateMotionStack([])).not.toThrow();
    expect(() =>
      validateMotionStack([{ type: "dolly", direction: "in", intensity: 0.5 }]),
    ).not.toThrow();
    expect(() =>
      validateMotionStack([
        { type: "dolly", direction: "in" },
        { type: "pan", direction: "left" },
        { type: "tilt", direction: "up" },
      ]),
    ).not.toThrow();
  });

  it("throws on 4 axes", () => {
    expect(() =>
      validateMotionStack([
        { type: "dolly" },
        { type: "pan" },
        { type: "tilt" },
        { type: "zoom" },
      ]),
    ).toThrowError(MotionStackOverflowError);
  });

  it("validates intensity range", () => {
    expect(() =>
      validateMotionStack([{ type: "dolly", intensity: 1.5 }]),
    ).toThrowError(/intensity/i);
    expect(() =>
      validateMotionStack([{ type: "dolly", intensity: -0.1 }]),
    ).toThrowError(/intensity/i);
  });

  it("renderAxis describes intensity qualitatively", () => {
    expect(
      renderAxis({ type: "dolly", direction: "in", intensity: 0.9 }),
    ).toMatch(/aggressive dolly-in/);
    expect(
      renderAxis({ type: "dolly", direction: "in", intensity: 0.1 }),
    ).toMatch(/subtle dolly-in/);
  });

  it("renderAxis emits startAt phrase", () => {
    expect(
      renderAxis({ type: "zoom", direction: "in", startAt: 0.5 }),
    ).toMatch(/starting at 50%/);
  });

  it("renderMotionStack joins 1/2/3 axes idiomatically", () => {
    expect(renderMotionStack([])).toBe("");
    expect(
      renderMotionStack([{ type: "dolly", direction: "in" }]),
    ).toMatch(/camera move:.*dolly-in/);
    const two = renderMotionStack([
      { type: "dolly", direction: "in" },
      { type: "whip", direction: "left" },
    ]);
    expect(two).toContain("while");
    const three = renderMotionStack([
      { type: "dolly", direction: "in" },
      { type: "whip", direction: "left" },
      { type: "tilt", direction: "up" },
    ]);
    expect(three).toContain("and");
  });

  it("builder chains up to 3 axes", () => {
    const stack = motion()
      .dollyIn(0.8)
      .whip("left", 0.9)
      .tilt("up", 0.4)
      .build();
    expect(stack).toHaveLength(3);
    expect(stack[0]!.type).toBe("dolly");
    expect(stack[1]!.type).toBe("whip");
    expect(stack[2]!.type).toBe("tilt");
  });

  it("builder throws on 4th axis", () => {
    const b = motion().dollyIn().whip("left").tilt("up");
    expect(() => b.zoom("in")).toThrowError(MotionStackOverflowError);
  });
});
