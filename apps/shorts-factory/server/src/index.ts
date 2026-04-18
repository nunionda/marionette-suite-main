import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { sourcesRoutes } from "./routes/sources";
import { templatesRoutes } from "./routes/templates";
import { assetsRoutes } from "./routes/assets";
import { candidatesRoutes } from "./routes/candidates";
import { renderRoutes } from "./routes/render";
import { reviewRoutes } from "./routes/review";
import { publishRoutes } from "./routes/publish";
import { analyticsRoutes } from "./routes/analytics";
import { kpopGroupsRoutes } from "./routes/kpop-groups";
import { startDetectorLoop } from "./services/detector";

// DB import triggers table creation + seed
import "./db";

const PORT = Number(process.env.PORT) || 3008;

const app = new Elysia()
  .use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [(process.env.NEXT_PUBLIC_SHORTS_FACTORY_URL ?? "http://localhost:5178")] }))
  .use(staticPlugin({ prefix: "/output", assets: "./output" }))
  .use(sourcesRoutes)
  .use(templatesRoutes)
  .use(assetsRoutes)
  .use(candidatesRoutes)
  .use(renderRoutes)
  .use(reviewRoutes)
  .use(publishRoutes)
  .use(analyticsRoutes)
  .use(kpopGroupsRoutes)

  // Health check
  .get("/api/health", () => ({
    status: "ok",
    service: "shorts-factory",
    timestamp: new Date().toISOString(),
  }))

  // Pipeline status overview (placeholder)
  .get("/api/pipeline/status", () => ({
    success: true,
    queued: 0,
    processing: 0,
    pendingReview: 0,
    scheduled: 0,
  }))

  .listen(PORT);

console.log(`🎬 Shorts Factory API running on http://localhost:${PORT}`);

// Start RSS polling loop after server is ready
startDetectorLoop();
