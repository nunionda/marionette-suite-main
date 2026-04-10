// ---------------------------------------------------------------------------
// VFXCompositorAgent — applies VFX post-processing to video clips using ffmpeg
// Replaces Python mock with real ffmpeg-based compositing effects
// ---------------------------------------------------------------------------

import { join } from "node:path"
import { mkdir, readdir, stat } from "node:fs/promises"
import type { DirectionPlan, Scene } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"

// ─── VFX effect presets using ffmpeg filters ───

interface VFXPreset {
  name: string
  description: string
  keywords: string[]
  /** ffmpeg -vf filter chain */
  filter: string
}

const VFX_PRESETS: VFXPreset[] = [
  {
    name: "hologram_glitch",
    description: "Digital hologram with scan lines and glitch effects",
    keywords: ["hologram", "digital", "cyber", "hack", "virtual", "ai", "computer"],
    filter:
      "split[a][b];" +
      "[b]chromashift=crh=3:crv=-2:cbh=-3:cbv=2,noise=alls=15:allf=t[glitch];" +
      "[a][glitch]blend=all_mode=screen:all_opacity=0.3",
  },
  {
    name: "dream_blur",
    description: "Dreamy soft glow for flashbacks and surreal scenes",
    keywords: ["dream", "memory", "flashback", "surreal", "vision", "past", "sleep"],
    filter:
      "split[a][b];" +
      "[b]gblur=sigma=12,curves=all='0/0 0.3/0.4 0.7/0.8 1/1'[glow];" +
      "[a][glow]blend=all_mode=screen:all_opacity=0.4",
  },
  {
    name: "rain_atmosphere",
    description: "Rain drops and wet surface reflections",
    keywords: ["rain", "storm", "wet", "dark", "night", "alley"],
    filter:
      "noise=alls=8:allf=t," +
      "eq=brightness=-0.02:contrast=1.15:saturation=0.9," +
      "colorbalance=rs=-0.03:bs=0.06",
  },
  {
    name: "explosion_shake",
    description: "Camera shake and flash for action/explosion scenes",
    keywords: ["explosion", "fight", "crash", "impact", "battle", "action", "chase"],
    filter:
      "crop=in_w-10:in_h-10:(5*sin(t*15)):(5*cos(t*12))," +
      "scale=in_w:in_h," +
      "eq=brightness=0.03:contrast=1.2:saturation=1.15",
  },
  {
    name: "surveillance",
    description: "CCTV/surveillance camera look with timestamp overlay",
    keywords: ["cctv", "surveillance", "monitor", "security", "camera", "footage"],
    filter:
      "noise=alls=20:allf=t," +
      "eq=saturation=0.5:contrast=1.1," +
      "drawtext=text='REC':fontsize=18:fontcolor=red:x=w-80:y=20",
  },
  {
    name: "none",
    description: "No VFX — pass through unchanged",
    keywords: [],
    filter: "null",
  },
]

// ─── Input extension ───

export interface VFXCompositorInput extends AgentInput {
  directionPlan?: DirectionPlan
  inputDir?: string // directory with scene video clips
  outputDir?: string
}

// ─── Agent ───

export class VFXCompositorAgent extends BaseAgent {
  readonly name = "VFXCompositor"
  readonly phase = ProductionPhase.POST
  readonly description =
    "Applies VFX post-processing effects to video clips using ffmpeg filters (glitch, glow, rain, shake)"

  async execute(input: VFXCompositorInput): Promise<AgentOutput> {
    const { projectId, runId, directionPlan } = input
    const inputDir = input.inputDir ?? "output/videos"
    const outputDir = input.outputDir ?? "output/vfx"

    this.log(`Starting VFX compositing for project ${projectId}`)
    await this.updateProgress(runId, 5)

    await mkdir(outputDir, { recursive: true })

    // Find video clips
    const videoFiles = await this.findVideoFiles(inputDir)
    if (videoFiles.length === 0) {
      this.log("No video clips found to process")
      return {
        success: true,
        message: "No video clips found — VFX skipped",
        data: { processedCount: 0 },
      }
    }

    this.log(`Found ${videoFiles.length} video clips to process`)
    await this.updateProgress(runId, 10)

    const processedFiles: string[] = []

    for (let i = 0; i < videoFiles.length; i++) {
      const videoPath = videoFiles[i]!
      const sceneNumber = this.extractSceneNumber(videoPath)
      const scene = directionPlan?.scenes.find(
        (s) => s.scene_number === sceneNumber,
      )

      // Select VFX preset based on scene content
      const preset = this.selectPreset(scene)

      if (preset.name === "none") {
        this.log(`Scene #${sceneNumber} — no VFX needed, skipping`)
        continue
      }

      this.log(`Scene #${sceneNumber} — applying "${preset.name}" VFX`)

      const outputPath = await this.applyVFX(
        videoPath,
        preset,
        outputDir,
        sceneNumber,
      )

      if (outputPath) {
        processedFiles.push(outputPath)

        await this.saveAsset({
          projectId,
          type: "VIDEO",
          agentName: this.name,
          filePath: outputPath,
          fileName: outputPath.split("/").pop() ?? `vfx_scene_${sceneNumber}.mp4`,
          mimeType: "video/mp4",
          sceneNumber,
          metadata: {
            preset: preset.name,
            filter: preset.filter,
            inputPath: videoPath,
          },
        })
      }

      const progress = Math.round(10 + (85 * ((i + 1) / videoFiles.length)))
      await this.updateProgress(runId, Math.min(progress, 95))
    }

    await this.updateProgress(runId, 100)

    this.log(
      `VFX compositing complete (${processedFiles.length}/${videoFiles.length} clips processed)`,
    )

    return {
      success: true,
      message: `VFXCompositor processed ${processedFiles.length} clips with effects`,
      outputPath: outputDir,
      data: {
        processedFiles,
        processedCount: processedFiles.length,
        totalClips: videoFiles.length,
      },
    }
  }

  // ── Internal methods ──────────────────────────────────────────

  private async applyVFX(
    inputPath: string,
    preset: VFXPreset,
    outputDir: string,
    sceneNumber: number,
  ): Promise<string | null> {
    const filename = `vfx_scene_${String(sceneNumber).padStart(3, "0")}.mp4`
    const outputPath = join(outputDir, filename)

    try {
      const result = await Bun.spawn({
        cmd: [
          "ffmpeg",
          "-y",
          "-i",
          inputPath,
          "-filter_complex",
          preset.filter,
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "22",
          "-c:a",
          "copy",
          "-movflags",
          "+faststart",
          outputPath,
        ],
        env: {
          ...process.env,
          PATH: `/opt/homebrew/bin:${process.env["HOME"]}/.bun/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${process.env["PATH"] ?? ""}`,
        },
        stdout: "ignore",
        stderr: "pipe",
      }).exited

      if (result !== 0) {
        throw new Error(`ffmpeg exited with code ${result}`)
      }

      const fileInfo = await stat(outputPath).catch(() => null)
      this.log(
        `Scene #${sceneNumber}: ${preset.name} applied (${fileInfo ? Math.round(fileInfo.size / 1024) + "KB" : "?"})`,
      )

      return outputPath
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(`VFX failed for scene #${sceneNumber}: ${errorMessage}`)
      return null
    }
  }

  private selectPreset(scene?: Scene): VFXPreset {
    if (!scene) return VFX_PRESETS.find((p) => p.name === "none")!

    const searchText =
      `${scene.setting} ${scene.action_description} ${scene.dialogue ?? ""}`.toLowerCase()

    let bestPreset = VFX_PRESETS.find((p) => p.name === "none")!
    let bestScore = 0

    for (const preset of VFX_PRESETS) {
      if (preset.name === "none") continue
      let score = 0
      for (const keyword of preset.keywords) {
        if (searchText.includes(keyword)) score++
      }
      if (score > bestScore) {
        bestScore = score
        bestPreset = preset
      }
    }

    return bestPreset
  }

  private async findVideoFiles(dir: string): Promise<string[]> {
    let entries: string[]
    try {
      entries = await readdir(dir)
    } catch {
      return []
    }

    const MIN_SIZE = 10_240
    const validFiles: string[] = []

    for (const name of entries.filter((n) => n.endsWith(".mp4")).sort()) {
      const filePath = join(dir, name)
      const fileInfo = await stat(filePath).catch(() => null)
      if (fileInfo && fileInfo.size > MIN_SIZE) {
        validFiles.push(filePath)
      }
    }

    return validFiles
  }

  private extractSceneNumber(filePath: string): number {
    const match = filePath.match(/scene[_-]?(\d+)/i)
    return match ? parseInt(match[1]!, 10) : 0
  }
}
