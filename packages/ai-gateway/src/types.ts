// ─── Request Options ───

export interface TextOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  responseSchema?: Record<string, unknown> // for structured output
}

export interface ImageOptions {
  width?: number
  height?: number
  style?: string // webtoon, photorealistic, anime, noir, concept_art
  aspectRatio?: string // "16:9", "2.35:1", "1:1"
}

export interface VideoOptions {
  duration?: number // seconds
  aspectRatio?: string
  resolution?: string
}

export interface AudioOptions {
  genre?: string
  duration?: number
  style?: string
}

export interface TTSOptions {
  voice?: string
  language?: string
  speed?: number
}

// ─── Results ───

export interface VideoResult {
  videoBuffer: Buffer
  duration: number
  mimeType: string
}

// ─── Capability-based Provider Interfaces ───

export interface TextProvider {
  generateText(prompt: string, options?: TextOptions): Promise<string>
}

export interface ImageProvider {
  generateImage(prompt: string, options?: ImageOptions): Promise<Buffer>
}

export interface VideoProvider {
  generateVideo(
    prompt: string,
    options?: VideoOptions,
  ): Promise<VideoResult>
}

export interface AudioProvider {
  generateAudio(prompt: string, options?: AudioOptions): Promise<Buffer>
}

export interface TTSProvider {
  generateTTS(text: string, options?: TTSOptions): Promise<Buffer>
}
