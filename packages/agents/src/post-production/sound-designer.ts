// ---------------------------------------------------------------------------
// SoundDesignerAgent — generates TTS dialogue audio for each scene
// Port of Python src/agents/sound_designer.py
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { DirectionPlan, Scene } from "@marionette/shared"
import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"

// ─── Input extension ───

export interface SoundDesignerInput extends AgentInput {
  directionPlan: DirectionPlan
  outputDir?: string
}

// ─── WAV helpers ───

const DEFAULT_SAMPLE_RATE = 24000
const CHANNELS = 1
const BITS_PER_SAMPLE = 16

/**
 * Convert raw PCM L16 data to a WAV file buffer.
 * Gemini TTS returns audio/L16;rate=24000 (16-bit mono PCM).
 */
function pcmToWav(pcmData: Buffer, sampleRate = DEFAULT_SAMPLE_RATE): Buffer {
  const dataSize = pcmData.length
  const fileSize = 44 + dataSize // 44-byte header + PCM data
  const byteRate = sampleRate * CHANNELS * (BITS_PER_SAMPLE / 8)
  const blockAlign = CHANNELS * (BITS_PER_SAMPLE / 8)

  const header = Buffer.alloc(44)
  let offset = 0

  // RIFF header
  header.write("RIFF", offset)
  offset += 4
  header.writeUInt32LE(fileSize - 8, offset)
  offset += 4
  header.write("WAVE", offset)
  offset += 4

  // fmt sub-chunk
  header.write("fmt ", offset)
  offset += 4
  header.writeUInt32LE(16, offset) // fmt chunk size
  offset += 4
  header.writeUInt16LE(1, offset) // PCM format
  offset += 2
  header.writeUInt16LE(CHANNELS, offset) // mono
  offset += 2
  header.writeUInt32LE(sampleRate, offset) // sample rate
  offset += 4
  header.writeUInt32LE(byteRate, offset) // byte rate
  offset += 4
  header.writeUInt16LE(blockAlign, offset) // block align
  offset += 2
  header.writeUInt16LE(BITS_PER_SAMPLE, offset) // bits per sample
  offset += 2

  // data sub-chunk
  header.write("data", offset)
  offset += 4
  header.writeUInt32LE(dataSize, offset)

  return Buffer.concat([header, pcmData])
}

// ─── Agent ───

export class SoundDesignerAgent extends BaseAgent {
  readonly name = "SoundDesigner"
  readonly phase = ProductionPhase.POST
  readonly description =
    "Generates TTS dialogue audio for each scene using Gemini TTS and saves WAV files"

  async execute(input: SoundDesignerInput): Promise<AgentOutput> {
    const { directionPlan, projectId, runId } = input
    const outputDir = input.outputDir ?? join("output", "audio", projectId)

    this.log(
      `Starting audio generation for "${directionPlan.title}" (${directionPlan.scenes.length} scenes)`,
    )
    await this.updateProgress(runId, 5)

    // Ensure output directory exists
    mkdirSync(outputDir, { recursive: true })

    const generatedFiles: string[] = []
    const totalScenes = directionPlan.scenes.length

    for (const scene of directionPlan.scenes) {
      const dialogue = scene.dialogue
      if (!dialogue || dialogue.toLowerCase() === "null") {
        this.log(`Scene #${scene.scene_number} — no dialogue, skipping`)
        continue
      }

      this.log(
        `Scene #${scene.scene_number} — generating TTS for: "${dialogue.slice(0, 50)}..."`,
      )

      const filePath = await this.generateSceneAudio(
        scene,
        dialogue,
        outputDir,
      )

      if (filePath) {
        generatedFiles.push(filePath)

        // Save asset to DB
        await this.saveAsset({
          projectId,
          type: "AUDIO",
          agentName: this.name,
          filePath,
          fileName: `scene_${String(scene.scene_number).padStart(3, "0")}_dialogue.wav`,
          mimeType: "audio/wav",
          sceneNumber: scene.scene_number,
          metadata: {
            dialogueText: dialogue,
            sampleRate: DEFAULT_SAMPLE_RATE,
            channels: CHANNELS,
            bitsPerSample: BITS_PER_SAMPLE,
          },
        })
      }

      // Update progress proportionally
      const progress = Math.round(
        5 + (90 * (generatedFiles.length / totalScenes)),
      )
      await this.updateProgress(runId, Math.min(progress, 95))
    }

    await this.updateProgress(runId, 100)

    this.log(
      `Audio generation complete (${generatedFiles.length} clips from ${totalScenes} scenes)`,
    )

    return {
      success: true,
      message: `SoundDesigner generated ${generatedFiles.length} audio clips for "${directionPlan.title}"`,
      outputPath: outputDir,
      data: {
        generatedFiles,
        clipCount: generatedFiles.length,
        totalScenes,
        globalAudioConcept: directionPlan.global_audio_concept,
      },
    }
  }

  /** Generate TTS audio for a single scene's dialogue and write it as WAV. */
  private async generateSceneAudio(
    scene: Scene,
    dialogue: string,
    outputDir: string,
  ): Promise<string | null> {
    try {
      const rawAudio = await this.gateway.tts(dialogue, {
        provider: "gemini",
        voice: "Kore",
      })

      const wavData = pcmToWav(rawAudio)

      const filename = `scene_${String(scene.scene_number).padStart(3, "0")}_dialogue.wav`
      const filePath = join(outputDir, filename)

      writeFileSync(filePath, wavData)

      this.log(
        `Scene #${scene.scene_number} TTS saved: ${filePath} (${Math.round(wavData.length / 1024)}KB)`,
      )

      return filePath
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(`Scene #${scene.scene_number} TTS error: ${errorMessage}`)
      return null
    }
  }
}
