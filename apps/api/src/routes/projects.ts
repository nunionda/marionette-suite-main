import { Hono } from "hono"
import type { ProjectCreate, ProjectUpdate } from "@marionette/shared/types/project.ts"
import { ValidationError } from "../middleware/error-handler.ts"
import * as projectService from "../services/project.service.ts"

export const projectRoutes = new Hono()

// GET / — list projects with pagination
projectRoutes.get("/", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") ?? 20)))

  const result = await projectService.listProjects(page, limit)
  return c.json(result)
})

// POST / — create project
projectRoutes.post("/", async (c) => {
  const body = await c.req.json<ProjectCreate>()

  if (!body.title || typeof body.title !== "string") {
    throw new ValidationError("title is required and must be a string")
  }

  const project = await projectService.createProject({
    title: body.title,
    genre: body.genre ?? "",
    logline: body.logline ?? "",
    idea: body.idea ?? "",
  })

  return c.json(project, 201)
})

// GET /:id — get project by id
projectRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const project = await projectService.getProject(id)
  return c.json(project)
})

// PATCH /:id — update project
projectRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json<ProjectUpdate>()
  const project = await projectService.updateProject(id, body)
  return c.json(project)
})

// DELETE /:id — delete project
projectRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id")
  await projectService.deleteProject(id)
  return c.json({ success: true })
})
