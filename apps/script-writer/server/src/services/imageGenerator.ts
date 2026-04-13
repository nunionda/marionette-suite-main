/**
 * Image Generator Service — generates photorealistic images via Pollinations FLUX.
 *
 * Used by Video Generation pipeline's image_gen node.
 * Takes a prompt and returns an image URL.
 */

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

export interface ImageGenResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  provider: string;
}

/**
 * Generate a photorealistic cinematic image from a text prompt.
 */
export async function generateImage(prompt: string, options: {
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
} = {}): Promise<ImageGenResult> {
  const { width = 1280, height = 720, seed, model = 'flux' } = options;

  try {
    // Pollinations generates images via URL encoding
    const encodedPrompt = encodeURIComponent(prompt);
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      model,
      nologo: 'true',
    });
    if (seed !== undefined) params.set('seed', String(seed));

    const imageUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?${params}`;

    // Verify the URL works by making a HEAD request
    const res = await fetch(imageUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'MarionetteStudio/1.0' },
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      return { success: true, imageUrl, provider: 'pollinations' };
    }
    return { success: false, error: `Pollinations returned ${res.status}`, provider: 'pollinations' };
  } catch (e: any) {
    return { success: false, error: e.message, provider: 'pollinations' };
  }
}

/**
 * Generate multiple image candidates for a cut.
 */
export async function generateImageCandidates(prompt: string, count: number = 4): Promise<ImageGenResult[]> {
  const results: ImageGenResult[] = [];
  for (let i = 0; i < count; i++) {
    const result = await generateImage(prompt, { seed: Math.floor(Math.random() * 999999) });
    results.push(result);
  }
  return results;
}

/**
 * Build a cinematic image prompt from cut data and production design context.
 */
export function buildCinematicPrompt(options: {
  description: string;
  characters?: string[];
  location?: string;
  timeOfDay?: string;
  visualTone?: string;
  cameraAngle?: string;
  characterRef?: string; // Character design reference for consistency
}): string {
  const parts = [
    'Photorealistic cinematic film still,',
    options.description,
  ];

  if (options.location) parts.push(`Location: ${options.location}.`);
  if (options.timeOfDay) parts.push(`Time: ${options.timeOfDay}.`);
  if (options.characters?.length) parts.push(`Characters: ${options.characters.join(', ')}.`);
  if (options.visualTone) parts.push(`Visual tone: ${options.visualTone}.`);
  if (options.cameraAngle) parts.push(`Camera: ${options.cameraAngle}.`);
  if (options.characterRef) parts.push(`Character reference: consistent with concept art style from ${options.characterRef}.`);
  parts.push('8K, shallow depth of field, anamorphic lens, film grain, dramatic lighting.');

  return parts.join(' ');
}
