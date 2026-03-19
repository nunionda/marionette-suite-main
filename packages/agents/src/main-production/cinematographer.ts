// ---------------------------------------------------------------------------
// CinematographerAgent — enhances video_prompts with professional DP details
// Port of Python src/agents/cinematographer.py
// ---------------------------------------------------------------------------

import type { DirectionPlan, Scene } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"

// ─── System prompt (from cinematographer.py) ───

const CINEMATOGRAPHER_SYSTEM_PROMPT = `You are a world-class Cinematographer (Director of Photography) at Marionette Studio.
Your job: Take each scene's existing video_prompt and UPGRADE it with professional cinematography details.

For each scene, enhance the video_prompt by adding:
1. **Lens choice**: specific focal length (e.g., 35mm anamorphic, 85mm portrait, 14mm ultra-wide)
2. **Camera movement**: precise movement description (dolly speed, crane height, Steadicam path)
3. **Lighting design**: key/fill/rim light setup, color temperature, practical lights
4. **Depth of field**: f-stop, focus pull targets, bokeh quality
5. **Color palette**: dominant colors, contrast ratio, specific color gels
6. **Atmosphere**: haze, rain, dust particles, volumetric light

RULES:
- Output MUST be in English
- Keep the original prompt's content, ADD cinematography details
- Think David Fincher (Se7en, Fight Club) meets Park Chan-wook (Oldboy) meets Roger Deakins
- Tone: dark neon tech-noir, anamorphic 2.35:1, high contrast
- Each enhanced prompt should be 3-5 sentences
- Include [Audio] tag at the end preserving original audio direction`

// ─── Input extension ───

export interface CinematographerInput extends AgentInput {
  directionPlan: DirectionPlan
}

// ─── Enhanced prompt schema for structured output ───

interface EnhancedPromptEntry {
  scene_number: number
  enhanced_video_prompt: string
}

// ─── Agent ───

export class CinematographerAgent extends BaseAgent {
  readonly name = "Cinematographer"
  readonly phase = ProductionPhase.MAIN
  readonly description =
    "Enhances video_prompts with professional cinematography details (lens, lighting, camera movement, color palette)"

  async execute(input: CinematographerInput): Promise<AgentOutput> {
    const { directionPlan, projectId, runId } = input

    this.log(
      `Enhancing video prompts for "${directionPlan.title}" (${directionPlan.scenes.length} scenes)`,
    )
    await this.updateProgress(runId, 5)

    // Build scene descriptions for the LLM
    const scenesText = directionPlan.scenes
      .map(
        (s: Scene) =>
          `--- Scene ${s.scene_number} ---\nSetting: ${s.setting}\nTime: ${s.time_of_day}\nCamera: ${s.camera_angle}\nOriginal video_prompt: ${s.video_prompt}`,
      )
      .join("\n\n")

    const userPrompt = `Enhance the video_prompt for each scene below.
Return a JSON array of objects with "scene_number" and "enhanced_video_prompt".

Title: ${directionPlan.title}
Genre: ${directionPlan.genre}
Global Audio: ${directionPlan.global_audio_concept}

${scenesText}`

    try {
      const response = await this.gateway.text(userPrompt, {
        provider: "gemini",
        systemPrompt: CINEMATOGRAPHER_SYSTEM_PROMPT,
        temperature: 0.5,
      })

      await this.updateProgress(runId, 70)

      // Parse JSON response
      const cleaned = response.replace(/```json\n?|\n?```/g, "").trim()
      const enhanced = JSON.parse(cleaned) as EnhancedPromptEntry[]

      // Build lookup map from scene_number -> enhanced prompt
      const enhancedMap = new Map<number, string>()
      for (const entry of enhanced) {
        enhancedMap.set(entry.scene_number, entry.enhanced_video_prompt)
      }

      // Apply enhancements to the direction plan
      const updatedScenes: Scene[] = directionPlan.scenes.map((scene) => {
        const enhancedPrompt = enhancedMap.get(scene.scene_number)
        if (enhancedPrompt) {
          this.log(`Scene #${scene.scene_number} video_prompt enhanced`)
          return { ...scene, video_prompt: enhancedPrompt }
        }
        return scene
      })

      const updatedPlan: DirectionPlan = {
        ...directionPlan,
        scenes: updatedScenes,
      }

      // Save enhanced plan back to project DB
      await this.db.project.update({
        where: { id: projectId },
        data: {
          directionPlan: JSON.parse(JSON.stringify(updatedPlan)),
        },
      })

      await this.updateProgress(runId, 100)

      this.log(
        `Enhancement complete (${enhancedMap.size}/${directionPlan.scenes.length} scenes upgraded)`,
      )

      return {
        success: true,
        message: `Cinematographer enhanced ${enhancedMap.size} scene video_prompts for "${directionPlan.title}"`,
        data: {
          directionPlan: updatedPlan,
          enhancedSceneCount: enhancedMap.size,
          totalSceneCount: directionPlan.scenes.length,
        },
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(`Error enhancing video prompts: ${errorMessage}`)
      return {
        success: false,
        message: `Failed to enhance video prompts: ${errorMessage}`,
      }
    }
  }
}
