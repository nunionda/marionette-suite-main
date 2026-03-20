// ---------------------------------------------------------------------------
// ConceptArtistAgent — generates storyboard images from DirectionPlan
// Port of Python src/agents/concept_artist.py
// ---------------------------------------------------------------------------

import type { DirectionPlan } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"
import { mkdir, writeFile, stat } from "node:fs/promises"
import { join } from "node:path"
import {
  STYLE_PRESETS,
  ASPECT_RATIOS,
  makeStoryboardFileName,
  buildEnhancedPrompt,
  cropToAspect,
} from "./style-presets.js"

// ─── Input extension ───

export interface ConceptArtistInput extends AgentInput {
  directionPlan: DirectionPlan
  style?: string
  outputDir?: string
}

// ─── Agent ───

export class ConceptArtistAgent extends BaseAgent {
  readonly name = "ConceptArtist"
  readonly phase = ProductionPhase.PRE
  readonly description = "Generates storyboard images from DirectionPlan scene prompts"

  async execute(input: ConceptArtistInput): Promise<AgentOutput> {
    const { directionPlan, projectId, runId } = input
    const styleKey = input.style ?? "webtoon"
    const outputDir = input.outputDir ?? "output/storyboards"
    const style = STYLE_PRESETS[styleKey] ?? STYLE_PRESETS.webtoon!
    const aspectKey = style.aspect
    const aspectRatio = ASPECT_RATIOS[aspectKey] ?? 2.35

    await mkdir(outputDir, { recursive: true })

    this.log(`Generating storyboards for "${directionPlan.title}" (${directionPlan.scenes.length} scenes)`)
    this.log(`Style: ${style.name} | Aspect: ${aspectKey}`)
    await this.updateProgress(runId, 5)

    const generatedImages: string[] = []

    for (let i = 0; i < directionPlan.scenes.length; i++) {
      const scene = directionPlan.scenes[i]!
      const sceneNum = scene.scene_number

      const seqNum = scene.sequence ?? 1
      this.log(`Scene ${sceneNum} (Seq ${seqNum}) — ${scene.setting} (${scene.time_of_day})`)

      const enhancedPrompt = buildEnhancedPrompt(scene.image_prompt, style, aspectKey)

      try {
        const imageBuffer = await this.gateway.image(enhancedPrompt, {
          provider: "gemini",
          style: styleKey,
          aspectRatio: aspectKey,
        })

        // Crop to target aspect ratio using sharp
        const croppedBuffer = await cropToAspect(imageBuffer, aspectRatio)

        const fileName = makeStoryboardFileName({ sequence: seqNum, sceneNumber: sceneNum })
        const filePath = join(outputDir, fileName)
        await writeFile(filePath, croppedBuffer)

        const fileInfo = await stat(filePath)
        this.log(`Scene ${sceneNum}: ${filePath} (${(fileInfo.size / 1024).toFixed(1)}KB)`)

        // Save asset to DB
        await this.saveAsset({
          projectId,
          type: "IMAGE",
          agentName: this.name,
          filePath,
          fileName,
          mimeType: "image/png",
          sceneNumber: sceneNum,
          fileSize: fileInfo.size,
          metadata: { style: styleKey, aspect: aspectKey },
        })

        generatedImages.push(filePath)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.log(`Scene ${sceneNum} image generation failed: ${msg}`)
        // Continue with remaining scenes
      }

      const progress = 5 + ((i + 1) / directionPlan.scenes.length) * 90
      await this.updateProgress(runId, progress)
    }

    await this.updateProgress(runId, 100)

    return {
      success: generatedImages.length > 0,
      message: `Generated ${generatedImages.length}/${directionPlan.scenes.length} storyboard images (${style.name})`,
      outputPath: outputDir,
      data: {
        images: generatedImages,
        style: styleKey,
        count: generatedImages.length,
      },
    }
  }

}
