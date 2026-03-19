import { prisma } from "@marionette/db"
import type { ProjectCreate, ProjectUpdate, ProjectResponse } from "@marionette/shared/types/project.ts"
import { NotFoundError } from "../middleware/error-handler.ts"

function toProjectResponse(project: {
  id: string
  title: string
  genre: string
  logline: string
  idea: string
  status: string
  progress: number
  protagonist: string
  antagonist: string
  worldview: string
  script: string | null
  directionPlan: unknown
  createdAt: Date
  updatedAt: Date
}): ProjectResponse {
  return {
    id: project.id,
    title: project.title,
    genre: project.genre,
    logline: project.logline,
    idea: project.idea,
    status: project.status as ProjectResponse["status"],
    progress: project.progress,
    protagonist: project.protagonist || null,
    antagonist: project.antagonist || null,
    worldview: project.worldview || null,
    script: project.script ?? null,
    direction_plan_json: (project.directionPlan as ProjectResponse["direction_plan_json"]) ?? null,
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
  }
}

export async function listProjects(page: number, limit: number) {
  const skip = (page - 1) * limit

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count(),
  ])

  return {
    projects: projects.map(toProjectResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getProject(id: string): Promise<ProjectResponse> {
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    throw new NotFoundError("Project", id)
  }
  return toProjectResponse(project)
}

export async function createProject(data: ProjectCreate): Promise<ProjectResponse> {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      genre: data.genre,
      logline: data.logline,
      idea: data.idea,
    },
  })
  return toProjectResponse(project)
}

export async function updateProject(id: string, data: ProjectUpdate): Promise<ProjectResponse> {
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw new NotFoundError("Project", id)
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.genre !== undefined && { genre: data.genre }),
      ...(data.logline !== undefined && { logline: data.logline }),
      ...(data.idea !== undefined && { idea: data.idea }),
      ...(data.status !== undefined && { status: data.status.toUpperCase() as "DRAFT" | "PRE_PRODUCTION" | "MAIN_PRODUCTION" | "POST_PRODUCTION" | "COMPLETED" | "ARCHIVED" }),
      ...(data.protagonist !== undefined && { protagonist: data.protagonist }),
      ...(data.antagonist !== undefined && { antagonist: data.antagonist }),
      ...(data.worldview !== undefined && { worldview: data.worldview }),
      ...(data.script !== undefined && { script: data.script }),
    },
  })
  return toProjectResponse(project)
}

export async function deleteProject(id: string): Promise<void> {
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw new NotFoundError("Project", id)
  }
  await prisma.project.delete({ where: { id } })
}
