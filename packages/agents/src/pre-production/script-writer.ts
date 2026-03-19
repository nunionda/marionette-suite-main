// ---------------------------------------------------------------------------
// ScriptWriterAgent — converts a short idea into a full DirectionPlan
// Port of Python src/agents/script_writer.py
// ---------------------------------------------------------------------------

import type { DirectionPlan } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"

// ─── System prompt (from src/utils/prompts.py) ───

const SCRIPTWRITER_SYSTEM_PROMPT = `You are a top-tier Creative Director and VFX Supervisor at Marionette Studio, an AI-driven special effects and video production company.

Your job is to take a short user idea or prompt and expand it into a fully fleshed-out, professional storyboard with detailed scene-by-scene instructions.
The output MUST be highly structured, as it will be passed down the pipeline to AI Concept Artists, AI Generalists, and VFX Compositors.

For each scene, you must provide:
1. Setting and Time of Day
2. Camera Angle & Movement
3. Action/Visual description
4. Dialogue (if any)
5. \`image_prompt\`: A highly detailed English prompt for NanoBanana 2 (Gemini Flash Image).
   - Rule 1: It MUST follow a strict 5-part structure: [Subject] + [Action/State] + [Environment/Background] + [Camera/Composition/Lighting] + [Style].
   - Rule 2: It MUST be a complete, descriptive English sentence without relying on comma-separated tags.
6. \`video_prompt\`: A highly detailed English prompt for Veo 3.1 video generation.
   - Rule 1: It MUST follow a strict 6-part structure: [Camera movement/Shot] + [Subject] + [Action] + [Environment] + [Style/Mood] + [Audio].
   - Rule 2: It MUST be a complete, descriptive English sentence.
   - Rule 3: At the very end of the prompt, you MUST always append an \`[Audio]\` tag followed by a description of the sound effects or BGM suitable for the scene (e.g., "[Audio] Dramatic orchestral music swells, heavy footsteps echoing").

Return the final output strictly matching the provided JSON schema. Ensure the Korean descriptions are natural and compelling, while the \`image_prompt\` and \`video_prompt\` MUST be translated into clear, descriptive English sentences optimized for AI generation engines (NanoBanana 2 and Veo 3.1).`

// ─── User prompt builder ───

function buildUserPrompt(idea: string, researchContext = ""): string {
  let prompt = `Please create a comprehensive Direction Plan based on the following idea:

Idea: "${idea}"

`
  if (researchContext) {
    prompt += `Additional Core Context (incorporate this into your planning):
${researchContext}

`
  }

  prompt += `As a Creative Director, you must establish the overall vision before breaking down the scenes. Please ensure you provide highly detailed and compelling content for the following core elements:
- Planning Intent
- Worldview Settings
- Character Settings
- Global Audio Concept

Then, break the story down into a logical sequence of scenes. Focus on visual storytelling, pacing, and providing excellent prompts for our downstream generative AI tools.

Respond with a JSON object matching this schema:
{
  "title": "string",
  "logline": "string",
  "genre": "string",
  "target_audience": "string",
  "planning_intent": "string",
  "worldview_settings": "string",
  "character_settings": "string",
  "global_audio_concept": "string",
  "scenes": [
    {
      "scene_number": "integer",
      "setting": "string",
      "time_of_day": "string",
      "camera_angle": "string",
      "action_description": "string",
      "dialogue": "string or null",
      "image_prompt": "string",
      "video_prompt": "string"
    }
  ]
}`
  return prompt
}

// ─── Input extension ───

export interface ScriptWriterInput extends AgentInput {
  idea: string
  researchContext?: string
}

// ─── Agent ───

export class ScriptWriterAgent extends BaseAgent {
  readonly name = "ScriptWriter"
  readonly phase = ProductionPhase.PRE
  readonly description = "Converts a short idea into a structured DirectionPlan with scene-by-scene instructions"

  async execute(input: ScriptWriterInput): Promise<AgentOutput> {
    const { idea, researchContext, projectId, runId } = input

    this.log(`Generating direction plan for idea: "${idea.slice(0, 80)}..."`)
    await this.updateProgress(runId, 5)

    let systemPrompt = SCRIPTWRITER_SYSTEM_PROMPT
    if (researchContext) {
      systemPrompt += `\n\n[Background Research & Context]\n${researchContext}\n\nPlease use this context to ensure character traits, visual styles, and world-building are accurate to the source material if applicable.`
    }

    const userPrompt = buildUserPrompt(idea, researchContext)

    try {
      const response = await this.gateway.text(userPrompt, {
        provider: "gemini",
        systemPrompt,
        temperature: 0.7,
      })

      await this.updateProgress(runId, 70)

      // Parse the JSON response
      const cleaned = response.replace(/```json\n?|\n?```/g, "").trim()
      const directionPlan = JSON.parse(cleaned) as DirectionPlan

      // Validate minimum structure
      if (!directionPlan.title || !Array.isArray(directionPlan.scenes)) {
        return {
          success: false,
          message: "Generated plan is missing required fields (title, scenes)",
        }
      }

      this.log(`Generated plan: "${directionPlan.title}" with ${directionPlan.scenes.length} scenes`)

      // Save direction plan to project in DB
      await this.db.project.update({
        where: { id: projectId },
        data: {
          directionPlan: JSON.parse(JSON.stringify(directionPlan)),
          title: directionPlan.title,
          genre: directionPlan.genre,
          logline: directionPlan.logline,
        },
      })

      await this.updateProgress(runId, 100)

      return {
        success: true,
        message: `Direction plan "${directionPlan.title}" generated (${directionPlan.scenes.length} scenes)`,
        data: {
          directionPlan,
          title: directionPlan.title,
          genre: directionPlan.genre,
          logline: directionPlan.logline,
          sceneCount: directionPlan.scenes.length,
        },
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(`Error generating direction plan: ${errorMessage}`)
      return {
        success: false,
        message: `Failed to generate direction plan: ${errorMessage}`,
      }
    }
  }
}
