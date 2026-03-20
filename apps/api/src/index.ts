import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import type { Server } from "bun"
import { projectRoutes } from "./routes/projects.ts"
import { pipelineRoutes } from "./routes/pipeline.ts"
import { agentRoutes } from "./routes/agents.ts"
import { assetRoutes } from "./routes/assets.ts"
import { screenplayRoutes } from "./routes/screenplay.ts"
import { brainstormRoutes } from "./routes/brainstorm.ts"
import { loglineRoutes } from "./routes/logline.ts"
import { promptGuideRoutes } from "./routes/prompt-guide.ts"
import { exportRoutes } from "./routes/export.ts"
import { snapshotRoutes } from "./routes/snapshots.ts"
import { batchRoutes } from "./routes/batch.ts"
import { errorHandler } from "./middleware/error-handler.ts"
import { wsHandler, initWSHandler } from "./ws/handler.ts"
import { pipelineBus } from "./services/pipeline.service.ts"
import { prisma } from "@marionette/db"

const app = new Hono()

app.use("*", logger())
app.use("*", cors())
app.onError(errorHandler)

app.get("/api/health", (c) => c.json({ status: "ok", service: "marionette-studio-api", version: "0.1.0" }))

app.route("/api/projects", projectRoutes)
app.route("/api/pipeline", pipelineRoutes)
app.route("/api/agents", agentRoutes)
app.route("/api/assets", assetRoutes)
app.route("/api/screenplay", screenplayRoutes)
app.route("/api/brainstorm", brainstormRoutes)
app.route("/api/logline", loglineRoutes)
app.route("/api/prompt-guide", promptGuideRoutes)
app.route("/api/export", exportRoutes)
app.route("/api/snapshots", snapshotRoutes)
app.route("/api/batch", batchRoutes)

// Initialize WebSocket handler with shared dependencies
initWSHandler(pipelineBus, prisma)

export default {
  port: 3001,
  fetch(req: Request, server: Server<undefined>) {
    // Intercept WebSocket upgrade before Hono
    if (new URL(req.url).pathname === "/api/pipeline/ws") {
      const upgraded = server.upgrade(req)
      if (upgraded) return undefined
      return new Response("WebSocket upgrade failed", { status: 400 })
    }
    return app.fetch(req)
  },
  websocket: wsHandler,
  idleTimeout: 255,
}
