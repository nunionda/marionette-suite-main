// ---------------------------------------------------------------------------
// GeneralistAgent — generates video clips from DirectionPlan scene prompts
// Port of Python src/agents/generalist.py
// ---------------------------------------------------------------------------

import type { DirectionPlan, Scene } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"
import { resolve, join } from "node:path"
import { mkdir, writeFile, stat } from "node:fs/promises"

// ─── Input extension ───

export interface GeneralistInput extends AgentInput {
  directionPlan: DirectionPlan
  outputDir?: string
}

// ─── Agent ───

export class GeneralistAgent extends BaseAgent {
  readonly name = "Generalist"
  readonly phase = ProductionPhase.MAIN
  readonly description =
    "Generates video clips for each scene using Veo 3.0 video generation"

  async execute(input: GeneralistInput): Promise<AgentOutput> {
    const { directionPlan, projectId, runId } = input
    const outputDir = resolve(input.outputDir ?? "output/videos")

    await mkdir(outputDir, { recursive: true })

    this.log(
      `Starting video generation for "${directionPlan.title}" (${directionPlan.scenes.length} scenes)`,
    )
    await this.updateProgress(runId, 5)

    const generatedVideos: string[] = []
    const totalScenes = directionPlan.scenes.length

    for (const scene of directionPlan.scenes) {
      const progressPct = Math.round(
        5 + ((scene.scene_number - 1) / totalScenes) * 85,
      )
      await this.updateProgress(runId, progressPct)

      this.log(
        `Scene ${scene.scene_number} — ${scene.setting}`,
      )
      this.log(
        `  Prompt: ${scene.video_prompt.slice(0, 80)}...`,
      )

      const filePath = await this.generateSceneVideo(
        scene,
        outputDir,
      )

      if (filePath) {
        generatedVideos.push(filePath)

        // Save asset to DB
        const fileStats = await stat(filePath).catch(() => null)
        await this.saveAsset({
          projectId,
          type: "VIDEO",
          agentName: this.name,
          filePath,
          fileName: filePath.split("/").pop() ?? `scene_${scene.scene_number}.mp4`,
          mimeType: filePath.endsWith(".mp4") ? "video/mp4" : "text/plain",
          sceneNumber: scene.scene_number,
          fileSize: fileStats?.size,
          metadata: {
            videoPrompt: scene.video_prompt,
            setting: scene.setting,
          },
        })
      }
    }

    await this.updateProgress(runId, 100)

    this.log(
      `Video generation complete! (${generatedVideos.length} clips)`,
    )

    return {
      success: true,
      message: `Generated ${generatedVideos.length} video clips for "${directionPlan.title}"`,
      data: {
        videoPaths: generatedVideos,
        sceneCount: totalScenes,
        generatedCount: generatedVideos.length,
      },
    }
  }

  // ── Scene video generation ─────────────────────────────────────

  private async generateSceneVideo(
    scene: Scene,
    outputDir: string,
  ): Promise<string | null> {
    // Try gateway.video() first — falls back to mock if not available
    try {
      const result = await this.gateway.video(scene.video_prompt, {
        provider: "gemini",
        aspectRatio: "16:9",
        duration: 8,
      })

      const filename = `scene_${String(scene.scene_number).padStart(3, "0")}.mp4`
      const filePath = join(outputDir, filename)
      await writeFile(filePath, result.videoBuffer)

      const sizeKb = result.videoBuffer.length / 1024
      this.log(`  Video generated: ${filePath} (${sizeKb.toFixed(0)}KB)`)
      return filePath
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(
        `  Veo 3.0 not available, falling back to mock: ${errorMessage}`,
      )

      // Mock fallback — create a placeholder text file
      return this.generateMockVideo(scene, outputDir)
    }
  }

  private async generateMockVideo(
    scene: Scene,
    outputDir: string,
  ): Promise<string> {
    const filename = `scene_${String(scene.scene_number).padStart(3, "0")}_mock.txt`
    const filePath = join(outputDir, filename)

    const content = [
      `[MOCK VIDEO] Scene ${scene.scene_number}`,
      `Setting: ${scene.setting}`,
      `Time of Day: ${scene.time_of_day}`,
      `Camera: ${scene.camera_angle}`,
      `Prompt: ${scene.video_prompt}`,
      "",
      "This is a placeholder file. When Veo 3.0 JS SDK support",
      "becomes available, this will be replaced with real video.",
    ].join("\n")

    await writeFile(filePath, content, "utf-8")
    this.log(`  Mock placeholder: ${filePath}`)
    return filePath
  }
}
