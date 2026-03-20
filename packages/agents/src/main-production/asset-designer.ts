// ---------------------------------------------------------------------------
// AssetDesignerAgent — generates 3D asset concept images and design specs
// Uses Gemini image generation for visual asset references
// (Real 3D model generation via Meshy/Tripo3D planned for future)
// ---------------------------------------------------------------------------

import { mkdir, writeFile, stat } from "node:fs/promises"
import { join } from "node:path"
import type { DirectionPlan } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"
import { cropToAspect } from "../pre-production/style-presets.js"

// ─── System prompt for asset analysis ───

const ASSET_ANALYSIS_PROMPT = `You are a 3D Asset Designer at Marionette Studio.
Your job: Analyze the project's worldview and scenes to identify key props, vehicles, environments, and objects that need 3D asset design.

For each asset, produce:
1. **name**: Asset name (e.g., "Neon Motorcycle", "Holographic Terminal")
2. **category**: prop, vehicle, weapon, furniture, architecture, environment, tech
3. **description**: Detailed visual description for concept art generation
4. **materials**: Key materials and textures (metal, glass, organic, etc.)
5. **scene_numbers**: Which scenes use this asset
6. **image_prompt**: English prompt for generating a concept art turnaround sheet showing the asset from multiple angles on a neutral gray background. 3-4 sentences.

RULES:
- Output MUST be in English
- Output JSON array of asset objects
- Focus on unique, story-important assets (not generic items)
- Maximum 10 assets per project
- image_prompt should specify: "3D concept art turnaround sheet, multiple angles, orthographic views, clean gray background"
- Think Weta Workshop concept art meets industrial design portfolio`

// ─── Input extension ───

export interface AssetDesignerInput extends AgentInput {
  directionPlan: DirectionPlan
  outputDir?: string
}

// ─── Asset entry from LLM ───

interface AssetEntry {
  name: string
  category: string
  description: string
  materials: string
  scene_numbers: number[]
  image_prompt: string
}

// ─── Agent ───

export class AssetDesignerAgent extends BaseAgent {
  readonly name = "AssetDesigner"
  readonly phase = ProductionPhase.MAIN
  readonly description =
    "Generates 3D asset concept art and design specifications for key props, vehicles, and environment objects"

  async execute(input: AssetDesignerInput): Promise<AgentOutput> {
    const { directionPlan, projectId, runId } = input
    const outputDir = input.outputDir ?? join("output", "assets", projectId)

    this.log(
      `Starting asset design for "${directionPlan.title}"`,
    )
    await this.updateProgress(runId, 5)

    await mkdir(outputDir, { recursive: true })

    try {
      // Step 1: Analyze project for required assets
      const assets = await this.analyzeAssets(directionPlan)
      this.log(`Identified ${assets.length} assets for design`)
      await this.updateProgress(runId, 20)

      // Step 2: Generate concept art for each asset
      const generatedFiles: string[] = []
      const assetSpecs: Record<string, unknown>[] = []

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]!
        this.log(
          `Generating concept art for "${asset.name}" (${asset.category})`,
        )

        const filePath = await this.generateAssetArt(
          asset,
          outputDir,
          i,
        )

        if (filePath) {
          generatedFiles.push(filePath)

          await this.saveAsset({
            projectId,
            type: "IMAGE",
            agentName: this.name,
            filePath,
            fileName: filePath.split("/").pop() ?? `asset_${i}.png`,
            mimeType: "image/png",
            sceneNumber: asset.scene_numbers[0],
            metadata: {
              assetName: asset.name,
              category: asset.category,
              materials: asset.materials,
              sceneNumbers: asset.scene_numbers,
            },
          })
        }

        assetSpecs.push({
          name: asset.name,
          category: asset.category,
          description: asset.description,
          materials: asset.materials,
          sceneNumbers: asset.scene_numbers,
          conceptArt: filePath,
        })

        const progress = Math.round(20 + (70 * ((i + 1) / assets.length)))
        await this.updateProgress(runId, Math.min(progress, 95))
      }

      // Step 3: Save asset spec document
      const specPath = join(outputDir, "asset_specs.json")
      await writeFile(specPath, JSON.stringify(assetSpecs, null, 2), "utf-8")

      await this.saveAsset({
        projectId,
        type: "DOCUMENT",
        agentName: this.name,
        filePath: specPath,
        fileName: "asset_specs.json",
        mimeType: "application/json",
        metadata: { assetCount: assets.length },
      })

      await this.updateProgress(runId, 100)

      this.log(
        `Asset design complete (${generatedFiles.length} concept art + spec document)`,
      )

      return {
        success: true,
        message: `AssetDesigner created ${generatedFiles.length} asset concept art images and spec document`,
        outputPath: outputDir,
        data: {
          generatedFiles,
          assetCount: generatedFiles.length,
          specPath,
          assets: assetSpecs,
        },
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(`Error during asset design: ${errorMessage}`)
      return {
        success: false,
        message: `Failed to generate assets: ${errorMessage}`,
      }
    }
  }

  // ── Internal methods ──────────────────────────────────────────

  private async analyzeAssets(
    plan: DirectionPlan,
  ): Promise<AssetEntry[]> {
    const userPrompt = `Analyze this project and identify the key 3D assets needed.

Title: ${plan.title}
Genre: ${plan.genre}
Worldview: ${plan.worldview_settings}
Characters: ${plan.character_settings}
Scene count: ${plan.scenes.length}

Scene settings: ${plan.scenes.map((s) => `Scene ${s.scene_number}: ${s.setting}`).join("; ")}`

    const response = await this.gateway.text(userPrompt, {
      provider: "gemini",
      systemPrompt: ASSET_ANALYSIS_PROMPT,
      temperature: 0.5,
    })

    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim()
    return JSON.parse(cleaned) as AssetEntry[]
  }

  private async generateAssetArt(
    asset: AssetEntry,
    outputDir: string,
    index: number,
  ): Promise<string | null> {
    try {
      const prompt =
        `3D concept art turnaround sheet. Clean neutral gray background. ` +
        `Multiple orthographic views: front, side, 3/4 angle, detail close-up. ` +
        `${asset.image_prompt}`

      const imageBuffer = await this.gateway.image(prompt, {
        provider: "gemini",
        style: "concept_art",
        aspectRatio: "16:9",
      })

      const croppedBuffer = await cropToAspect(imageBuffer, 16 / 9)

      const safeName = asset.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase()
        .slice(0, 30)
      const filename = `asset_${String(index + 1).padStart(2, "0")}_${safeName}.png`
      const filePath = join(outputDir, filename)

      await writeFile(filePath, croppedBuffer)

      const fileInfo = await stat(filePath)
      this.log(
        `${asset.name}: ${filePath} (${(fileInfo.size / 1024).toFixed(1)}KB)`,
      )

      return filePath
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(
        `Asset art generation failed for "${asset.name}": ${errorMessage}`,
      )
      return null
    }
  }
}
