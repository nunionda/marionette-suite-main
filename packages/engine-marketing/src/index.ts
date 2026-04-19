/**
 * @marionette/engine-marketing — Higgsfield Marketing Studio-style engine.
 *
 * Layer 3 orchestrator: given a product brief + style + platform target,
 * compose a ShotRequest stack and delegate to CinemaOrchestrator. The
 * marketing engine is thus a *specialization* of cinema with
 * platform + style constraints baked in, not a parallel implementation.
 */
export * from "./ad-style-registry";
export * from "./platform-publisher";
export * from "./product-extractor";
export * from "./avatar-builder";
export * from "./orchestrator";
