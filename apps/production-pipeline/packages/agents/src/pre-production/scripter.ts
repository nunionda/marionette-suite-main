// ---------------------------------------------------------------------------
// ScripterAgent — parses completed screenplay (.md) into DirectionPlan JSON
// Port of Python src/agents/scripter.py
// ---------------------------------------------------------------------------

import type { DirectionPlan, Scene } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"
import { readFile } from "node:fs/promises"

// ─── System prompt ───

const PARSER_SYSTEM_PROMPT = `You are a precise Film Script Analyzer at Marionette Studio.

Your job: Read a completed Hollywood Master Scene Format screenplay and extract structured data for each scene into a DirectionPlan JSON.

## EXTRACTION RULES

For each scene (marked with ### S#N), extract:

1. **scene_number**: The scene number (integer)
2. **setting**: Location and environment description in Korean
3. **time_of_day**: Time from slug line
4. **camera_angle**: The FIRST and most prominent camera direction
5. **action_description**: Concise summary of visual action (2-3 sentences, Korean)
6. **dialogue**: The most important dialogue line (Korean, 1-2 lines). null if none.
7. **image_prompt**: Detailed English prompt for AI image generation (5-part: Subject + Action + Environment + Camera/Lighting + Style)
8. **video_prompt**: Detailed English prompt for AI video generation (6-part: Camera Movement + Subject + Action + Environment + Style/Mood + Audio). Must include [Audio] tag.

## CRITICAL RULES
- image_prompt and video_prompt MUST be in English
- All other fields in Korean
- Extract the VISUAL ESSENCE of each scene
`

// ─── Input extension ───

export interface ScripterInput extends AgentInput {
  scriptPath: string
  charactersPath?: string
  outlinePath?: string
  sceneRange?: { start: number; end: number }
}

// ─── Agent ───

export class ScripterAgent extends BaseAgent {
  readonly name = "Scripter"
  readonly phase = ProductionPhase.PRE
  readonly description = "Parses completed screenplay into DirectionPlan JSON"

  async execute(input: ScripterInput): Promise<AgentOutput> {
    const { scriptPath, charactersPath, outlinePath, sceneRange, projectId, runId } = input

    this.log(`Loading screenplay: ${scriptPath}`)
    await this.updateProgress(runId, 5)

    const scriptText = await readFile(scriptPath, "utf-8")
    const metadata = this.parseMetadata(scriptText)
    this.log(`Title: ${metadata.title ?? "Unknown"} | Genre: ${metadata.genre ?? "Unknown"}`)

    // Load supplementary files
    let charactersJson = ""
    if (charactersPath) {
      try {
        charactersJson = await readFile(charactersPath, "utf-8")
      } catch { /* optional file */ }
    }

    let outlineText = ""
    if (outlinePath) {
      try {
        outlineText = await readFile(outlinePath, "utf-8")
      } catch { /* optional file */ }
    }

    // Split into scenes
    let sceneTexts = this.splitScenes(scriptText)
    this.log(`Detected ${sceneTexts.length} scenes`)

    // Filter by range
    if (sceneRange) {
      sceneTexts = sceneTexts.filter((text) => {
        const match = text.match(/S#(\d+)/)
        if (!match) return false
        const num = parseInt(match[1]!, 10)
        return num >= sceneRange.start && num <= sceneRange.end
      })
      this.log(`Filtered to ${sceneTexts.length} scenes (S#${sceneRange.start}~S#${sceneRange.end})`)
    }

    // Process in batches of 10
    const BATCH_SIZE = 10
    const allParsedScenes: Scene[] = []

    for (let i = 0; i < sceneTexts.length; i += BATCH_SIZE) {
      const batch = sceneTexts.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      this.log(`Batch ${batchNum}: parsing ${batch.length} scenes...`)

      const parsed = await this.parseScenesBatch(batch, metadata, charactersJson, outlineText)
      allParsedScenes.push(...parsed)

      const progress = 10 + ((i + batch.length) / sceneTexts.length) * 80
      await this.updateProgress(runId, progress)
    }

    // Assemble DirectionPlan
    const directionPlan: DirectionPlan = {
      title: metadata.title ?? "Untitled",
      logline: outlineText.slice(0, 200) || (metadata.title ?? ""),
      genre: metadata.genre ?? "Thriller",
      target_audience: "성인 / 글로벌 시장",
      planning_intent: `${metadata.tone ?? ""} 톤의 영상 제작 기획안`,
      worldview_settings: "",
      character_settings: charactersJson.slice(0, 500),
      global_audio_concept: "Neon Tech-Noir ambient, electronic score with tension builds, tactical SFX",
      scenes: allParsedScenes,
    }

    // Save to DB
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
      message: `Parsed "${directionPlan.title}" — ${allParsedScenes.length} scenes`,
      data: {
        directionPlan,
        title: directionPlan.title,
        sceneCount: allParsedScenes.length,
      },
    }
  }

  // ─── Helpers ───

  private splitScenes(scriptText: string): string[] {
    const pattern = /(### S#\d+\..*?)(?=### S#\d+\.|## STAGE|$)/gs
    const matches = [...scriptText.matchAll(pattern)]
    return matches.map((m) => m[1]!.trim()).filter(Boolean)
  }

  private parseMetadata(scriptText: string): { title?: string; genre?: string; tone?: string } {
    const titleMatch = scriptText.match(/^#\s*(.+)/m)
    const genreMatch = scriptText.match(/\*\*장르\*\*\s*[:：]\s*(.+)/)
    const toneMatch = scriptText.match(/\*\*톤\*\*\s*[:：]\s*(.+)/)

    return {
      title: titleMatch?.[1]?.trim(),
      genre: genreMatch?.[1]?.trim(),
      tone: toneMatch?.[1]?.trim(),
    }
  }

  private async parseScenesBatch(
    sceneTexts: string[],
    metadata: { title?: string; genre?: string; tone?: string },
    charactersJson: string,
    outlineText: string,
  ): Promise<Scene[]> {
    const contextParts: string[] = []
    if (outlineText) contextParts.push(`[OUTLINE]\n${outlineText.slice(0, 3000)}`)
    if (charactersJson) contextParts.push(`[CHARACTERS]\n${charactersJson.slice(0, 5000)}`)
    const context = contextParts.join("\n\n")

    const scenesBlock = sceneTexts.join("\n\n---\n\n")

    const userPrompt = `Parse the following ${sceneTexts.length} scenes from "${metadata.title ?? "Untitled"}".

Genre: ${metadata.genre ?? "Thriller"}
Tone: ${metadata.tone ?? "Dark, cinematic"}

${context ? `[CONTEXT]\n${context}` : ""}

[SCENES TO PARSE]
${scenesBlock}

Return a JSON array of Scene objects. Each must have: scene_number, setting, time_of_day, camera_angle, action_description, dialogue (or null), image_prompt, video_prompt.`

    try {
      const response = await this.gateway.text(userPrompt, {
        provider: "gemini",
        systemPrompt: PARSER_SYSTEM_PROMPT,
        temperature: 0.3,
      })

      const cleaned = response.replace(/```json\n?|\n?```/g, "").trim()
      const parsed = JSON.parse(cleaned) as Scene[]
      return parsed
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.log(`Scene parsing error: ${msg}`)
      throw err
    }
  }
}
