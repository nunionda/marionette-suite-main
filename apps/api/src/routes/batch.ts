import { Hono } from "hono"
import * as batchService from "../services/batch.service.ts"
import { ConcurrencyError } from "../services/batch.service.ts"

export const batchRoutes = new Hono()

// POST /:projectId/run — create and start a batch run
batchRoutes.post("/:projectId/run", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const batchRun = await batchService.createBatchRun(projectId)
    return c.json(batchRun, 201)
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      return c.json({ error: { code: err.code, message: err.message } }, 409)
    }
    throw err
  }
})

// GET /:projectId/runs — list batch runs for a project
batchRoutes.get("/:projectId/runs", async (c) => {
  const projectId = c.req.param("projectId")
  const runs = await batchService.listBatchRuns(projectId)
  return c.json({ runs })
})

// GET /:projectId/run/:batchRunId — get batch run detail
batchRoutes.get("/:projectId/run/:batchRunId", async (c) => {
  const batchRunId = c.req.param("batchRunId")
  const batchRun = await batchService.getBatchRun(batchRunId)
  return c.json(batchRun)
})

// POST /:batchRunId/cancel — cancel a running batch run
batchRoutes.post("/:batchRunId/cancel", async (c) => {
  const batchRunId = c.req.param("batchRunId")
  try {
    await batchService.cancelBatchRun(batchRunId)
    return c.json({ ok: true })
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      return c.json({ error: { code: err.code, message: err.message } }, 409)
    }
    throw err
  }
})

// POST /:batchRunId/scene/:sceneNumber/regenerate — regenerate a single scene
batchRoutes.post("/:batchRunId/scene/:sceneNumber/regenerate", async (c) => {
  const batchRunId = c.req.param("batchRunId")
  const sceneNumber = parseInt(c.req.param("sceneNumber"), 10)
  try {
    await batchService.regenerateScene(batchRunId, sceneNumber)
    return c.json({ ok: true })
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      return c.json({ error: { code: err.code, message: err.message } }, 409)
    }
    throw err
  }
})

// POST /:batchRunId/scene/:sceneNumber/cut/:cutNumber/regenerate — regenerate a single cut
batchRoutes.post("/:batchRunId/scene/:sceneNumber/cut/:cutNumber/regenerate", async (c) => {
  const batchRunId = c.req.param("batchRunId")
  const sceneNumber = parseInt(c.req.param("sceneNumber"), 10)
  const cutNumber = parseInt(c.req.param("cutNumber"), 10)
  try {
    await batchService.regenerateCut(batchRunId, sceneNumber, cutNumber)
    return c.json({ ok: true })
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      return c.json({ error: { code: err.code, message: err.message } }, 409)
    }
    throw err
  }
})

// POST /:batchRunId/rerun-from/:sceneNumber — rerun from a given scene
batchRoutes.post("/:batchRunId/rerun-from/:sceneNumber", async (c) => {
  const batchRunId = c.req.param("batchRunId")
  const fromSceneNumber = parseInt(c.req.param("sceneNumber"), 10)
  try {
    await batchService.rerunFrom(batchRunId, fromSceneNumber)
    return c.json({ ok: true })
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      return c.json({ error: { code: err.code, message: err.message } }, 409)
    }
    throw err
  }
})
