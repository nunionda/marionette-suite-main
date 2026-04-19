/**
 * Motion stack — up to 3 simultaneous camera moves per Higgsfield spec.
 *
 * The ai-providers `MotionAxis[]` type is the raw shape we forward; this
 * module adds validation + human-readable rendering so providers without
 * structured motion support still receive the intent via the prompt.
 *
 * Max 3 axes is a hard cap from Higgsfield Cinema 3.5 — exceeding it
 * degrades perceptual coherence (the model "mixes" moves rather than
 * layering). We enforce it as a thrown error, not a silent truncate, so
 * the UI can surface a clear message.
 */
import type { MotionAxis } from "@marionette/ai-providers/video";

export const MAX_MOTION_AXES = 3;

export class MotionStackOverflowError extends Error {
  constructor(count: number) {
    super(
      `Motion stack exceeds ${MAX_MOTION_AXES} axes (got ${count}). ` +
        `Higgsfield Cinema 3.5 caps at ${MAX_MOTION_AXES} for coherence.`,
    );
    this.name = "MotionStackOverflowError";
  }
}

export function validateMotionStack(stack: MotionAxis[] = []): void {
  if (stack.length > MAX_MOTION_AXES) {
    throw new MotionStackOverflowError(stack.length);
  }
  for (const axis of stack) {
    if (axis.intensity !== undefined) {
      if (axis.intensity < 0 || axis.intensity > 1) {
        throw new Error(
          `Motion intensity must be in [0..1], got ${axis.intensity}`,
        );
      }
    }
    if (axis.startAt !== undefined) {
      if (axis.startAt < 0 || axis.startAt > 1) {
        throw new Error(`Motion startAt must be in [0..1], got ${axis.startAt}`);
      }
    }
  }
}

/**
 * Render a single axis as a human-readable phrase.
 *
 * Examples:
 *   { type: "dolly", direction: "in", intensity: 0.8 }
 *     → "aggressive dolly-in"
 *   { type: "whip", direction: "left" }
 *     → "whip pan left"
 */
export function renderAxis(axis: MotionAxis): string {
  const intensity = axis.intensity ?? 0.5;
  const qualifier =
    intensity >= 0.75 ? "aggressive " :
    intensity <= 0.25 ? "subtle " :
    "";
  const dir = axis.direction ? `-${axis.direction}` : "";
  const startAt =
    axis.startAt !== undefined && axis.startAt > 0
      ? ` starting at ${Math.round(axis.startAt * 100)}% through the shot`
      : "";
  return `${qualifier}${axis.type}${dir}${startAt}`.trim();
}

/**
 * Render the whole stack as a single prompt-friendly phrase.
 * Empty stack returns "".
 */
export function renderMotionStack(stack: MotionAxis[] = []): string {
  if (stack.length === 0) return "";
  validateMotionStack(stack);
  const phrases = stack.map(renderAxis);
  if (phrases.length === 1) return `camera move: ${phrases[0]}`;
  // 2–3 axes: "X while Y" / "X, Y, and Z"
  if (phrases.length === 2) return `camera move: ${phrases[0]} while ${phrases[1]}`;
  return `camera moves: ${phrases[0]}, ${phrases[1]}, and ${phrases[2]}`;
}

/**
 * Convenience builder — e.g. motion.dollyIn(0.8).whipLeft(0.6). Chainable
 * to cap at MAX_MOTION_AXES, throws on overflow.
 */
export class MotionStackBuilder {
  private readonly axes: MotionAxis[] = [];

  private add(axis: MotionAxis): this {
    if (this.axes.length >= MAX_MOTION_AXES) {
      throw new MotionStackOverflowError(this.axes.length + 1);
    }
    this.axes.push(axis);
    return this;
  }

  dollyIn(intensity = 0.5): this { return this.add({ type: "dolly", direction: "in", intensity }); }
  dollyOut(intensity = 0.5): this { return this.add({ type: "dolly", direction: "out", intensity }); }
  pan(direction: "left" | "right", intensity = 0.5): this { return this.add({ type: "pan", direction, intensity }); }
  tilt(direction: "up" | "down", intensity = 0.5): this { return this.add({ type: "tilt", direction, intensity }); }
  zoom(direction: "in" | "out", intensity = 0.5): this { return this.add({ type: "zoom", direction, intensity }); }
  orbit(direction: "cw" | "ccw", intensity = 0.5): this { return this.add({ type: "orbit", direction, intensity }); }
  crane(direction: "up" | "down", intensity = 0.5): this { return this.add({ type: "crane", direction, intensity }); }
  handheld(intensity = 0.4): this { return this.add({ type: "handheld", intensity }); }
  whip(direction: "left" | "right", intensity = 0.9): this { return this.add({ type: "whip", direction, intensity }); }
  roll(direction: "cw" | "ccw", intensity = 0.3): this { return this.add({ type: "roll", direction, intensity }); }
  pushIn(intensity = 0.6): this { return this.add({ type: "push-in", intensity }); }
  pullOut(intensity = 0.6): this { return this.add({ type: "pull-out", intensity }); }

  build(): MotionAxis[] {
    return [...this.axes];
  }
}

export function motion(): MotionStackBuilder {
  return new MotionStackBuilder();
}
