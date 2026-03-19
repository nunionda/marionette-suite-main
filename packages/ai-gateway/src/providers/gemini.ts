/**
 * GeminiProvider — wraps @google/generative-ai for text, image, video, and TTS.
 *
 * Mirrors the API call patterns from the Python agents:
 *   - ScriptWriterAgent  (text, structured output)
 *   - ConceptArtistAgent (image generation via response_modalities)
 *   - GeneralistAgent    (Veo 3.0 video, async polling)
 *   - SoundDesignerAgent (TTS via speech_config)
 */
import { GoogleGenerativeAI } from "@google/generative-ai"
import type {
  TextProvider,
  ImageProvider,
  VideoProvider,
  TTSProvider,
  TextOptions,
  ImageOptions,
  VideoOptions,
  TTSOptions,
  VideoResult,
} from "../types.js"

// ─── Style presets (ported from concept_artist.py) ───

const STYLE_PRESETS: Record<string, { name: string; promptPrefix: string; aspect: string }> = {
  webtoon: {
    name: "Webtoon",
    promptPrefix:
      "Digital webtoon illustration style. " +
      "Clean ink outlines with cel-shading, rich saturated colors, " +
      "dramatic lighting with strong rim lights and deep shadows. " +
      "Detailed character faces with expressive eyes. " +
      "Korean manhwa / webtoon aesthetic with cinematic composition. ",
    aspect: "2.35:1",
  },
  photorealistic: {
    name: "Photorealistic",
    promptPrefix:
      "Hyperrealistic cinematic still frame. " +
      "Shot on ARRI Alexa 65mm with anamorphic lens flare. " +
      "Film grain, shallow depth of field, professional color grading. ",
    aspect: "2.35:1",
  },
  anime: {
    name: "Anime",
    promptPrefix:
      "High-quality anime illustration. " +
      "Detailed anime character design, vibrant palette, " +
      "dynamic action lines, Studio Ghibli meets Makoto Shinkai lighting. ",
    aspect: "16:9",
  },
  noir: {
    name: "Neo-Noir",
    promptPrefix:
      "Dark neo-noir graphic novel style. " +
      "High contrast black and white with selective neon color accents. " +
      "Heavy chiaroscuro, rain-slicked surfaces, moody atmospheric fog. ",
    aspect: "2.35:1",
  },
  concept_art: {
    name: "Concept Art",
    promptPrefix:
      "Professional film concept art. " +
      "Painterly digital matte painting style, " +
      "atmospheric perspective, detailed environment design, " +
      "cinematic color palette with teal and orange grading. ",
    aspect: "2.35:1",
  },
}

// ─── Models ───

const TEXT_MODEL = "gemini-2.5-flash"
const IMAGE_MODEL = "gemini-2.5-flash-image"
const VIDEO_MODEL = "veo-3.0-generate-001"
const TTS_MODEL = "gemini-2.5-flash-preview-tts"

// ─── Helpers ───

function getApiKey(): string {
  const key = process.env["GEMINI_API_KEY"] ?? process.env["Gemini_Api_Key"]
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Set it before using GeminiProvider.",
    )
  }
  return key
}

// ─── Provider ───

export class GeminiProvider
  implements TextProvider, ImageProvider, VideoProvider, TTSProvider
{
  private readonly client: GoogleGenerativeAI
  private readonly apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? getApiKey()
    this.client = new GoogleGenerativeAI(this.apiKey)
  }

  // ── Text generation ──────────────────────────────────────────────

  async generateText(prompt: string, options: TextOptions = {}): Promise<string> {
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens,
    }
    if (options.responseSchema) {
      generationConfig["responseMimeType"] = "application/json"
      generationConfig["responseSchema"] = options.responseSchema
    }

    const model = this.client.getGenerativeModel({
      model: TEXT_MODEL,
      systemInstruction: options.systemPrompt,
      generationConfig: generationConfig as import("@google/generative-ai").GenerationConfig,
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return text
  }

  // ── Image generation (REST API direct call) ─────────────────────
  //
  // The @google/generative-ai JS SDK does not support
  // `responseModalities: ["image", "text"]` which is required for
  // Gemini Flash Image generation. We call the REST API directly
  // using the same pattern as the Python `google-genai` package.

  async generateImage(prompt: string, options: ImageOptions = {}): Promise<Buffer> {
    const styleKey = options.style ?? "webtoon"
    const preset = STYLE_PRESETS[styleKey] ?? STYLE_PRESETS["webtoon"]!
    const aspect = options.aspectRatio ?? preset!.aspect

    const enhancedPrompt =
      `Generate a cinematic storyboard image in ultra-wide ${aspect} aspect ratio. ` +
      `${preset!.promptPrefix}` +
      `Compose the scene horizontally -- place key subjects in the center-third, ` +
      `leave cinematic breathing room on both sides. ` +
      `Think anamorphic widescreen film frame. ` +
      `\n\n${prompt}`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${this.apiKey}`

    const body = {
      contents: [{ parts: [{ text: enhancedPrompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 0.8,
      },
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Gemini Image API error (${res.status}): ${errorText}`)
    }

    const data = await res.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { data: string; mimeType: string }
            text?: string
          }>
        }
      }>
    }

    const parts = data.candidates?.[0]?.content?.parts ?? []

    for (const part of parts) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, "base64")
      }
    }

    throw new Error("Gemini image generation returned no image data")
  }

  // ── Video generation (Veo 3.0 REST API — async polling) ─────────

  async generateVideo(
    prompt: string,
    options: VideoOptions = {},
  ): Promise<VideoResult> {
    const aspect = options.aspectRatio ?? "16:9"
    const duration = options.duration ?? 8

    const enhancedPrompt =
      `Cinematic film scene. Anamorphic ${aspect} widescreen composition. ${duration} seconds. ` +
      `\n\n${prompt}`

    // Step 1: Submit video generation request
    const submitUrl = `https://generativelanguage.googleapis.com/v1beta/models/${VIDEO_MODEL}:predictLongRunning?key=${this.apiKey}`

    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: enhancedPrompt }],
        parameters: {
          aspectRatio: aspect,
          personGeneration: "allow_all",
        },
      }),
    })

    if (!submitRes.ok) {
      const errText = await submitRes.text()
      throw new Error(`Veo 3.0 submit failed (${submitRes.status}): ${errText}`)
    }

    const submitData = await submitRes.json() as { name: string }
    const operationName = submitData.name

    // Step 2: Poll for completion (max 5 minutes)
    const maxPolls = 30
    const pollInterval = 10_000

    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, pollInterval))

      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${this.apiKey}`,
      )
      const pollData = await pollRes.json() as {
        done?: boolean
        response?: {
          generateVideoResponse?: {
            generatedSamples?: Array<{
              video?: { uri: string }
            }>
          }
        }
        error?: { message: string }
      }

      if (pollData.error) {
        throw new Error(`Veo 3.0 generation failed: ${pollData.error.message}`)
      }

      if (pollData.done) {
        const samples = pollData.response?.generateVideoResponse?.generatedSamples
        if (!samples?.length) {
          throw new Error("Veo 3.0 completed but returned no video samples")
        }

        const videoUri = samples[0]!.video?.uri
        if (!videoUri) {
          throw new Error("Veo 3.0 sample has no video URI")
        }

        // Step 3: Download the video file
        const downloadUrl = `${videoUri}&key=${this.apiKey}`
        const downloadRes = await fetch(downloadUrl)

        if (!downloadRes.ok) {
          throw new Error(`Veo 3.0 video download failed (${downloadRes.status})`)
        }

        const videoBuffer = Buffer.from(await downloadRes.arrayBuffer())

        return {
          videoBuffer,
          duration,
          mimeType: "video/mp4",
        }
      }
    }

    throw new Error(`Veo 3.0 video generation timed out after ${maxPolls * pollInterval / 1000}s`)
  }

  // ── TTS ──────────────────────────────────────────────────────────

  async generateTTS(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const voice = options.voice ?? "Kore"

    const model = this.client.getGenerativeModel({
      model: TTS_MODEL,
      generationConfig: {
        // @ts-expect-error -- TTS-specific config not in stable types yet
        responseModalities: ["audio"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    })

    const result = await model.generateContent(text)
    const parts = result.response.candidates?.[0]?.content?.parts ?? []

    for (const part of parts) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, "base64")
      }
    }

    throw new Error("Gemini TTS returned no audio data")
  }
}
