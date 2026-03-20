// ---------------------------------------------------------------------------
// Storyboard style presets, aspect ratios, and shared utilities
// Extracted from ConceptArtistAgent for reuse across API routes and agents
// ---------------------------------------------------------------------------

// ─── Aspect ratio presets ───

export const ASPECT_RATIOS: Record<string, number> = {
  "2.35:1": 2.35,
  "16:9": 16 / 9,
  "1.85:1": 1.85,
  "4:3": 4 / 3,
  "1:1": 1.0,
}

// ─── Style presets ───

export interface StylePreset {
  name: string
  promptPrefix: string
  aspect: string
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
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

// ─── File naming ───

/**
 * Generate storyboard file name following the naming convention:
 * - Cut: seq01_sc003_c002.png
 * - Scene: seq01_sc003.png
 * - Regeneration: seq01_sc003_c002_1710921600.png
 */
export function makeStoryboardFileName(opts: {
  sequence: number
  sceneNumber: number
  cutNumber?: number
  timestamp?: number
}): string {
  const seq = String(opts.sequence).padStart(2, "0")
  const sc = String(opts.sceneNumber).padStart(3, "0")
  const base = opts.cutNumber
    ? `seq${seq}_sc${sc}_c${String(opts.cutNumber).padStart(3, "0")}`
    : `seq${seq}_sc${sc}`
  const suffix = opts.timestamp ? `_${opts.timestamp}` : ""
  return `${base}${suffix}.png`
}

// ─── Enhanced prompt builder ───

export function buildEnhancedPrompt(imagePrompt: string, style: StylePreset, aspectKey: string): string {
  return (
    `Generate a cinematic storyboard image in ultra-wide ${aspectKey} aspect ratio. ` +
    style.promptPrefix +
    `Compose the scene horizontally — place key subjects in the center-third, ` +
    `leave cinematic breathing room on both sides. ` +
    `Think anamorphic widescreen film frame. ` +
    `\n\n${imagePrompt}`
  )
}

// ─── Image cropping ───

/**
 * Crop buffer to target aspect ratio.
 * Gemini Flash Image outputs 1024x1024 — we center-crop to target ratio.
 */
export async function cropToAspect(imageBuffer: Buffer, targetRatio: number): Promise<Buffer> {
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
