import { prisma } from "@marionette/db"
import type { ProjectCreate, ProjectUpdate, ProjectResponse } from "@marionette/shared/types/project.ts"
import { NotFoundError, ValidationError } from "../middleware/error-handler.ts"

const VALID_STATUSES = new Set(["DRAFT", "PRE_PRODUCTION", "MAIN_PRODUCTION", "POST_PRODUCTION", "COMPLETED", "ARCHIVED"])

function toProjectResponse(project: any): ProjectResponse {
  const dev = project.development || {}
  return {
    id: project.id,
    title: project.title,
    genre: dev.genre || "",
    logline: dev.logline || "",
    idea: dev.idea || "",
    status: project.status as ProjectResponse["status"],
    progress: project.progress,
    protagonist: dev.protagonist || null,
    antagonist: dev.antagonist || null,
    worldview: dev.worldview || null,
    script: dev.script ?? null,
    direction_plan_json: (project.directionPlan as ProjectResponse["direction_plan_json"]) ?? null,
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
  }
}

export async function listProjects(page: number, limit: number, userId?: string) {
  const skip = (page - 1) * limit
  const where = userId ? { userId } : {}

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: { development: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ])

  return {
    projects: projects.map(toProjectResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getProject(id: string, userId?: string): Promise<ProjectResponse> {
  const project = await prisma.project.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
    include: { development: true },
  })
  if (!project) {
    throw new NotFoundError("Project", id)
  }
  return toProjectResponse(project)
}

export async function createProject(data: ProjectCreate, userId?: string): Promise<ProjectResponse> {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      status: "DRAFT",
      ...(userId ? { userId } : {}),
      development: {
        create: {
          genre: data.genre || "",
          logline: data.logline || "",
          idea: data.idea || "",
        }
      }
    },
    include: { development: true }
  })
  return toProjectResponse(project)
}

export async function updateProject(id: string, data: ProjectUpdate, userId?: string): Promise<ProjectResponse> {
  const existing = await prisma.project.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
  })
  if (!existing) {
    throw new NotFoundError("Project", id)
  }

  if (data.status !== undefined) {
    const upper = data.status.toUpperCase()
    if (!VALID_STATUSES.has(upper)) {
      throw new ValidationError(`Invalid status '${data.status}'. Must be one of: ${[...VALID_STATUSES].join(", ")}`)
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.status !== undefined && { status: data.status.toUpperCase() as any }),
      development: {
        upsert: {
          create: {
            genre: data.genre || "",
            logline: data.logline || "",
            idea: data.idea || "",
            protagonist: data.protagonist || "",
            antagonist: data.antagonist || "",
            worldview: data.worldview || "",
            script: data.script || "",
          },
          update: {
            ...(data.genre !== undefined && { genre: data.genre }),
            ...(data.logline !== undefined && { logline: data.logline }),
            ...(data.idea !== undefined && { idea: data.idea }),
            ...(data.protagonist !== undefined && { protagonist: data.protagonist }),
            ...(data.antagonist !== undefined && { antagonist: data.antagonist }),
            ...(data.worldview !== undefined && { worldview: data.worldview }),
            ...(data.script !== undefined && { script: data.script }),
          }
        }
      }
    },
    include: { development: true }
  })
  return toProjectResponse(project)
}

export async function deleteProject(id: string, userId?: string): Promise<void> {
  const existing = await prisma.project.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
  })
  if (!existing) {
    throw new NotFoundError("Project", id)
  }
  await prisma.project.delete({ where: { id } })
}
