import { Hono } from "hono"
import type { ProjectCreate, ProjectUpdate } from "@marionette/shared/types/project.ts"
import { ValidationError } from "../middleware/error-handler.ts"
import type { AuthUser } from "../middleware/auth.ts"
import * as projectService from "../services/project.service.ts"

export const projectRoutes = new Hono()

function getUserId(c: { get: (key: string) => unknown }): string {
  const user = c.get("user") as AuthUser | undefined
  return user?.id ?? ""
}

// GET / — list projects with pagination
projectRoutes.get("/", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") ?? 20)))
  const userId = getUserId(c)

  const result = await projectService.listProjects(page, limit, userId || undefined)
  return c.json(result)
})

// POST / — create project
projectRoutes.post("/", async (c) => {
  const body = await c.req.json<ProjectCreate>()
  const userId = getUserId(c)

  if (!body.title || typeof body.title !== "string") {
    throw new ValidationError("title is required and must be a string")
  }

  const project = await projectService.createProject({
    title: body.title,
    genre: body.genre ?? "",
    logline: body.logline ?? "",
    idea: body.idea ?? "",
  }, userId || undefined)

  return c.json(project, 201)
})

// GET /:id — get project by id
projectRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const userId = getUserId(c)
  const project = await projectService.getProject(id, userId || undefined)
  return c.json(project)
})

// PATCH /:id — update project
projectRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json<ProjectUpdate>()
  const userId = getUserId(c)
  const project = await projectService.updateProject(id, body, userId || undefined)
  return c.json(project)
})

// DELETE /:id — delete project
projectRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id")
  const userId = getUserId(c)
  await projectService.deleteProject(id, userId || undefined)
  return c.json({ success: true })
})
