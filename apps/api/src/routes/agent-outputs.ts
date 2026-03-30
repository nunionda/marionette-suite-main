import { Hono } from "hono"
import { prisma } from "@marionette/db"
import { NotFoundError } from "../middleware/error-handler.ts"
import type {
  CastingDirectorOutput,
  LocationScoutOutput,
  CinematographerOutput,
  CinematographerScene,
} from "@marionette/shared"
import type { DirectionPlan, Scene } from "@marionette/shared"

export const agentOutputRoutes = new Hono()

// ─── Helpers ───

/** Find the latest completed pipeline run for a project that includes a given step. */
async function getLatestStepResult(projectId: string, stepName: string) {
  const run = await prisma.pipelineRun.findFirst({
    where: {
      projectId,
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
  })

  if (!run) return null

  const results = (run.stepResults ?? {}) as Record<string, Record<string, unknown>>
  return results[stepName] ?? null
}

// ─── GET /casting-director ───

agentOutputRoutes.get("/casting-director", async (c) => {
  const projectId = c.req.param("projectId") as string

  // Check project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new NotFoundError("Project", projectId)

  // Check if the agent has run
  const stepResult = await getLatestStepResult(projectId, "casting_director")
  if (!stepResult) {
    return c.json({ error: "Agent has not run yet" }, 404)
  }

  // Enrich with asset data — each asset has character metadata
  const assets = await prisma.asset.findMany({
    where: { projectId, agentName: "CastingDirector" },
    orderBy: { createdAt: "desc" },
  })

  const characters = assets.map((a) => {
    const meta = (a.metadata ?? {}) as Record<string, unknown>
    return {
      name: (meta.characterName as string) ?? "",
      age_gender: (meta.ageGender as string) ?? "",
      physical_description: "",
      wardrobe: "",
      expression_pose: "",
      reference_actor: (meta.referenceActor as string) ?? "",
      image_prompt: "",
      image_path: a.filePath,
      image_url: `/api/assets/${a.id}/file`,
    }
  })

  const output: CastingDirectorOutput = { characters }
  return c.json(output)
})

// ─── GET /location-scout ───

agentOutputRoutes.get("/location-scout", async (c) => {
  const projectId = c.req.param("projectId") as string

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new NotFoundError("Project", projectId)

  const stepResult = await getLatestStepResult(projectId, "location_scout")
  if (!stepResult) {
    return c.json({ error: "Agent has not run yet" }, 404)
  }

  // Enrich with asset data
  const assets = await prisma.asset.findMany({
    where: { projectId, agentName: "LocationScout" },
    orderBy: { createdAt: "desc" },
  })

  const locations = assets.map((a) => {
    const meta = (a.metadata ?? {}) as Record<string, unknown>
    return {
      scene_numbers: (meta.sceneNumbers as number[]) ?? [],
      setting: (meta.setting as string) ?? "",
      time_of_day: (meta.timeOfDay as string) ?? "",
      description: "",
      image_prompt: "",
      image_path: a.filePath,
      image_url: `/api/assets/${a.id}/file`,
    }
  })

  const output: LocationScoutOutput = { locations }
  return c.json(output)
})

// ─── GET /cinematographer ───

agentOutputRoutes.get("/cinematographer", async (c) => {
  const projectId = c.req.param("projectId") as string

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new NotFoundError("Project", projectId)

  const stepResult = await getLatestStepResult(projectId, "cinematographer")
  if (!stepResult) {
    return c.json({ error: "Agent has not run yet" }, 404)
  }

  // Cinematographer writes enhanced prompts back to directionPlan
  const plan = project.directionPlan as DirectionPlan | null
  if (!plan?.scenes) {
    return c.json({ error: "Agent has not run yet" }, 404)
  }

  const scenes: CinematographerScene[] = plan.scenes.map((s: Scene) => ({
    scene_number: s.scene_number,
    original_prompt: s.video_prompt ?? "",
    enhanced_prompt: s.video_prompt ?? "",
    lens: "",
    camera_movement: "",
    lighting: "",
  }))

  const output: CinematographerOutput = { scenes }
  return c.json(output)
})
