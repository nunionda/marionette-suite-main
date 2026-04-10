import { Hono } from "hono"
import { prisma } from "@marionette/db"
import { NotFoundError } from "../middleware/error-handler.ts"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { zipSync, strToU8 } from "fflate"

export const exportRoutes = new Hono()

// GET /:projectId — export project assets as ZIP
exportRoutes.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId")
  const typeFilter = c.req.query("type")

  // Fetch project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!project) {
    throw new NotFoundError("Project", projectId)
  }

  // Fetch assets with optional type filter
  const where: Record<string, unknown> = { projectId }
  if (typeFilter) {
    const types = typeFilter.split(",").map((t) => t.trim().toUpperCase())
    where["type"] = { in: types }
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: [{ type: "asc" }, { sceneNumber: "asc" }],
  })

  // Build ZIP contents
  const zipData: Record<string, Uint8Array> = {}

  // Add each asset file
  const assetManifest: Array<{
    type: string
    fileName: string
    agent: string
    scene: number | null
  }> = []

  for (const asset of assets) {
    try {
      const absolutePath = resolve(asset.filePath)
      const fileBuffer = await readFile(absolutePath)
      const zipPath = `${asset.type}/${asset.fileName}`
      zipData[zipPath] = new Uint8Array(fileBuffer)
      assetManifest.push({
        type: asset.type,
        fileName: asset.fileName,
        agent: asset.agentName,
        scene: asset.sceneNumber,
      })
    } catch {
      // Skip files that can't be read
      continue
    }
  }

  // Add project metadata JSON
  const projectMeta = {
    title: project.title,
    genre: project.genre,
    logline: project.logline,
    status: project.status,
    exportedAt: new Date().toISOString(),
    assetCount: assetManifest.length,
    assets: assetManifest,
  }
  zipData["project.json"] = strToU8(JSON.stringify(projectMeta, null, 2))

  // Generate ZIP
  const zipped = zipSync(zipData)

  // Build safe filename
  const safeName = project.title
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50) || "project"

  c.header("Content-Type", "application/zip")
  c.header("Content-Disposition", `attachment; filename="${safeName}.zip"`)
  c.header("Content-Length", String(zipped.length))

  return c.body(zipped.buffer as ArrayBuffer)
})
