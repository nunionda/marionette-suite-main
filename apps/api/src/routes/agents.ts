import { Hono } from "hono"
import { prisma } from "@marionette/db"
import { NotFoundError, ValidationError } from "../middleware/error-handler.ts"

export const agentRoutes = new Hono()

// GET / — list all agent configs
agentRoutes.get("/", async (c) => {
  const agents = await prisma.agentConfig.findMany({
    orderBy: { agentName: "asc" },
  })

  return c.json({
    agents: agents.map((agent) => ({
      name: agent.agentName,
      phase: agent.phase.toLowerCase(),
      provider: agent.provider,
      model: agent.model,
      enabled: agent.enabled,
      config: agent.config,
      updated_at: agent.updatedAt.toISOString(),
    })),
  })
})

// PATCH /:name/config — update agent config
agentRoutes.patch("/:name/config", async (c) => {
  const name = c.req.param("name")
  const body = await c.req.json<{
    provider?: string
    model?: string
    enabled?: boolean
  }>()

  if (body.provider !== undefined && typeof body.provider !== "string") {
    throw new ValidationError("provider must be a string")
  }
  if (body.model !== undefined && typeof body.model !== "string") {
    throw new ValidationError("model must be a string")
  }
  if (body.enabled !== undefined && typeof body.enabled !== "boolean") {
    throw new ValidationError("enabled must be a boolean")
  }

  const existing = await prisma.agentConfig.findUnique({
    where: { agentName: name },
  })

  if (!existing) {
    throw new NotFoundError("AgentConfig", name)
  }

  const updated = await prisma.agentConfig.update({
    where: { agentName: name },
    data: {
      ...(body.provider !== undefined && { provider: body.provider }),
      ...(body.model !== undefined && { model: body.model }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
    },
  })

  return c.json({
    name: updated.agentName,
    phase: updated.phase.toLowerCase(),
    provider: updated.provider,
    model: updated.model,
    enabled: updated.enabled,
    config: updated.config,
    updated_at: updated.updatedAt.toISOString(),
  })
})
