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

// ─── Aspect ratio presets ───

const ASPECT_RATIOS: Record<string, number> = {
  "2.35:1": 2.35,
  "16:9": 16 / 9,
  "1.85:1": 1.85,
  "4:3": 4 / 3,
  "1:1": 1.0,
}

// ─── Style presets ───

interface StylePreset {
  name: string
  promptPrefix: string
  aspect: string
}

const STYLE_PRESETS: Record<string, StylePreset> = {
  webtoon: {
    name: "Webtoon",
    promptPrefix:
      "Digital webtoon illustration style. Clean ink outlines with cel-shading, rich saturated colors, dramatic lighting with strong rim lights and deep shadows. Detailed character faces with expressive eyes. Korean manhwa / webtoon aesthetic with cinematic composition. ",
    aspect: "2.35:1",
  },
  photorealistic: {
    name: "Photorealistic",
    promptPrefix:
      "Hyperrealistic cinematic still frame. Shot on ARRI Alexa 65mm with anamorphic lens flare. Film grain, shallow depth of field, professional color grading. ",
    aspect: "2.35:1",
  },
  anime: {
    name: "Anime",
    promptPrefix:
      "High-quality anime illustration. Detailed anime character design, vibrant palette, dynamic action lines, Studio Ghibli meets Makoto Shinkai lighting. ",
    aspect: "16:9",
  },
  noir: {
    name: "Neo-Noir",
    promptPrefix:
      "Dark neo-noir graphic novel style. High contrast black and white with selective neon color accents. Heavy chiaroscuro, rain-slicked surfaces, moody atmospheric fog. ",
    aspect: "2.35:1",
  },
  concept_art: {
    name: "Concept Art",
    promptPrefix:
      "Professional film concept art. Painterly digital matte painting style, atmospheric perspective, detailed environment design, cinematic color palette with teal and orange grading. ",
    aspect: "2.35:1",
  },
}

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

      this.log(`Scene ${sceneNum} — ${scene.setting} (${scene.time_of_day})`)

      const enhancedPrompt =
        `Generate a cinematic storyboard image in ultra-wide ${aspectKey} aspect ratio. ` +
        style.promptPrefix +
        `Compose the scene horizontally — place key subjects in the center-third, ` +
        `leave cinematic breathing room on both sides. ` +
        `Think anamorphic widescreen film frame. ` +
        `\n\n${scene.image_prompt}`

      try {
        const imageBuffer = await this.gateway.image(enhancedPrompt, {
          provider: "gemini",
          style: styleKey,
          aspectRatio: aspectKey,
        })

        // Crop to target aspect ratio using sharp
        const croppedBuffer = await this.cropToAspect(imageBuffer, aspectRatio)

        const fileName = `scene_${String(sceneNum).padStart(3, "0")}.png`
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

  /**
   * Crop buffer to target aspect ratio.
   * Gemini Flash Image outputs 1024x1024 — we center-crop to target ratio.
   */
  private async cropToAspect(imageBuffer: Buffer, targetRatio: number): Promise<Buffer> {
    try {
      const sharp = (await import("sharp")).default
      const image = sharp(imageBuffer)
      const metadata = await image.metadata()

      const w = metadata.width ?? 1024
      const h = metadata.height ?? 1024
      const currentRatio = w / h

      if (Math.abs(currentRatio - targetRatio) < 0.05) {
        return imageBuffer // Already close enough
      }

      let cropWidth: number
      let cropHeight: number
      let left: number
      let top: number

      if (targetRatio > currentRatio) {
        // Need wider — crop top/bottom
        cropWidth = w
        cropHeight = Math.round(w / targetRatio)
        left = 0
        top = Math.round((h - cropHeight) / 2)
      } else {
        // Need taller — crop left/right
        cropHeight = h
        cropWidth = Math.round(h * targetRatio)
        left = Math.round((w - cropWidth) / 2)
        top = 0
      }

      // Final output: 1024px wide
      const finalW = 1024
      const finalH = Math.round(finalW / targetRatio)

      return await image
        .extract({ left, top, width: cropWidth, height: cropHeight })
        .resize(finalW, finalH)
        .png()
        .toBuffer()
    } catch {
      // If sharp fails, return original
      return imageBuffer
    }
  }
}
