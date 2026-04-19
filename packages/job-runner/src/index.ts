/**
 * @marionette/job-runner — durable execution for Layer-3 engines.
 *
 * Sits between the Hub UI (Sprint 15) and the engines (Sprint 13). The
 * orchestrators already know how to produce output; this package adds:
 *
 *   - persistent queue + retry (JobQueue)
 *   - progress events over a pub/sub bus (ProgressBus)
 *   - durable bytes storage (AssetStorage)
 *   - small worker helpers (createAssetIngestHandler, wrapAsJobHandler)
 *
 * All interfaces ship with an in-memory impl for dev/tests. Production
 * swaps in Redis+BullMQ + Vercel Blob at the composition root.
 */
export * from "./types";
export * from "./progress";
export * from "./queue";
export * from "./storage";
export * from "./worker";
