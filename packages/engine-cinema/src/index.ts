/**
 * @marionette/engine-cinema — Higgsfield Cinema Studio 3.5-style engine.
 *
 * Layer 3 orchestrator: given a shot intent, resolve a video provider,
 * collect element references, compose camera + motion + ramp, submit
 * the job, record usage. Framework-agnostic — `packages/job-runner/`
 * (Sprint 14) wraps this in a durable workflow for retries/resumability.
 */
export * from "./camera-registry";
export * from "./motion-stack";
export * from "./speed-ramp";
export * from "./shot-sequence";
export * from "./orchestrator";
