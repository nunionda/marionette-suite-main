import { Hono } from "hono"
import { prisma } from "@marionette/db"
import { NotFoundError } from "../middleware/error-handler.ts"

export const snapshotRoutes = new Hono()

// ─── Helper: create a snapshot before overwriting data ───

export async function createSnapshot(
  projectId: string,
  type: string,
  data: unknown,
): Promise<void> {
  if (data === null || data === undefined) return

  try {
    // Get next version number
    const latest = await prisma.projectSnapshot.findFirst({
      where: { projectId, type },
      orderBy: { version: "desc" },
      select: { version: true },
    })
    const nextVersion = (latest?.version ?? 0) + 1

    await prisma.projectSnapshot.create({
      data: {
        projectId,
        type,
        version: nextVersion,
        data: JSON.parse(JSON.stringify(data)),
      },
    })
  } catch (err) {
    // Non-blocking: log but don't fail the parent operation
    console.error(`[Snapshot] Failed to save ${type} v${0} for project ${projectId}:`, err)
  }
}

// ─── Routes ───

// GET /:projectId — list snapshots for a project (optionally filtered by type)
snapshotRoutes.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId")
  const type = c.req.query("type")

  const snapshots = await prisma.projectSnapshot.findMany({
    where: {
      projectId,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      version: true,
      label: true,
      createdAt: true,
    },
  })

  return c.json({ snapshots })
})

// GET /:projectId/:snapshotId — get a single snapshot with data
snapshotRoutes.get("/:projectId/:snapshotId", async (c) => {
  const snapshotId = c.req.param("snapshotId")

  const snapshot = await prisma.projectSnapshot.findUnique({
    where: { id: snapshotId },
  })

  if (!snapshot) {
    throw new NotFoundError("Snapshot", snapshotId)
  }

  return c.json({ snapshot })
})

// POST /:projectId/:snapshotId/restore — restore a snapshot
snapshotRoutes.post("/:projectId/:snapshotId/restore", async (c) => {
  const projectId = c.req.param("projectId")
  const snapshotId = c.req.param("snapshotId")

  const snapshot = await prisma.projectSnapshot.findUnique({
    where: { id: snapshotId },
  })

  if (!snapshot || snapshot.projectId !== projectId) {
    throw new NotFoundError("Snapshot", snapshotId)
  }

  // Save current state as a new snapshot before restoring (safety net)
  if (snapshot.type === "DIRECTION_PLAN") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { directionPlan: true },
    })
    if (project?.directionPlan) {
      await createSnapshot(projectId, "DIRECTION_PLAN", project.directionPlan)
    }
    await prisma.project.update({
      where: { id: projectId },
      data: { directionPlan: snapshot.data ?? undefined },
    })
  } else if (snapshot.type === "SCREENPLAY_OUTLINE") {
    const screenplay = await prisma.screenplay.findUnique({
      where: { projectId },
      select: { outline: true },
    })
    if (screenplay?.outline) {
      await createSnapshot(projectId, "SCREENPLAY_OUTLINE", screenplay.outline)
    }
    await prisma.screenplay.update({
      where: { projectId },
      data: { outline: snapshot.data as string },
    })
  } else if (snapshot.type === "SCREENPLAY_DRAFT") {
    const screenplay = await prisma.screenplay.findUnique({
      where: { projectId },
      select: { draft: true },
    })
    if (screenplay?.draft) {
      await createSnapshot(projectId, "SCREENPLAY_DRAFT", screenplay.draft)
    }
    await prisma.screenplay.update({
      where: { projectId },
      data: { draft: snapshot.data as string },
    })
  } else if (snapshot.type === "SCREENPLAY_CHARACTERS") {
    const screenplay = await prisma.screenplay.findUnique({
      where: { projectId },
      select: { characters: true },
    })
    if (screenplay?.characters) {
      await createSnapshot(projectId, "SCREENPLAY_CHARACTERS", screenplay.characters)
    }
    await prisma.screenplay.update({
      where: { projectId },
      data: { characters: snapshot.data ?? undefined },
    })
  }

  return c.json({ restored: true, type: snapshot.type, version: snapshot.version })
})

// PATCH /:projectId/:snapshotId — update snapshot label
snapshotRoutes.patch("/:projectId/:snapshotId", async (c) => {
  const snapshotId = c.req.param("snapshotId")
  const body = await c.req.json<{ label?: string }>()

  const snapshot = await prisma.projectSnapshot.update({
    where: { id: snapshotId },
    data: { label: body.label ?? null },
    select: { id: true, label: true },
  })

  return c.json({ snapshot })
})
