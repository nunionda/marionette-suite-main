import { Hono } from "hono"
import type { PipelineRunCreate } from "@marionette/shared/types/pipeline.ts"
import { ValidationError } from "../middleware/error-handler.ts"
import * as pipelineService from "../services/pipeline.service.ts"

export const pipelineRoutes = new Hono()

// POST /:projectId/run — start a pipeline run
pipelineRoutes.post("/:projectId/run", async (c) => {
  const projectId = c.req.param("projectId")
  const body = await c.req.json<PipelineRunCreate>()

  if (!Array.isArray(body.steps) || body.steps.length === 0) {
    throw new ValidationError("steps must be a non-empty array of strings")
  }

  const run = await pipelineService.createRun(projectId, body.steps, body.idea)

  // Kick off async execution (don't await)
  void pipelineService.executeRun(run.id, body.idea)

  return c.json(run, 201)
})

// GET /:projectId/runs — list runs for project
pipelineRoutes.get("/:projectId/runs", async (c) => {
  const projectId = c.req.param("projectId")
  const runs = await pipelineService.listRuns(projectId)
  return c.json({ runs })
})

// GET /run/:runId — get run status (for polling)
pipelineRoutes.get("/run/:runId", async (c) => {
  const runId = c.req.param("runId")
  const run = await pipelineService.getRun(runId)
  return c.json(run)
})
