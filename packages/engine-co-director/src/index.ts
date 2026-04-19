/**
 * @marionette/engine-co-director — Mr. Higgs-style project co-director.
 *
 * Layer 3 engine #3 of 3. Unlike cinema and marketing (which produce
 * pixels/frames), this engine *observes* project state and advises the
 * operator on what to do next. Read-only over ElementStore; optionally
 * wraps a TextProvider for open-ended chat.
 */
export * from "./project-context";
export * from "./suggestion-engine";
export * from "./chat-stream";
export * from "./orchestrator";
