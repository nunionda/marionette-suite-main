/**
 * Image Generator Service — generates photorealistic images via Pollinations FLUX.
 *
 * Used by Video Generation pipeline's image_gen node.
 * Downloads the image and saves locally for reliable serving.
 */

import fs from 'fs';
import path from 'path';

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
const STORYBOARD_DIR = path.join(process.cwd(), 'public', 'storyboard', 'images');
if (!fs.existsSync(STORYBOARD_DIR)) fs.mkdirSync(STORYBOARD_DIR, { recursive: true });

export interface ImageGenResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  provider: string;
}

/**
 * Generate a photorealistic cinematic image from a text prompt.
 * Downloads to local server and returns a local URL for reliable browser display.
 */
export async function generateImage(prompt: string, options: {
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  cutId?: string;
} = {}): Promise<ImageGenResult> {
  const { width = 1280, height = 720, seed, model = 'flux', cutId } = options;

  try {
    // Shorten prompt for URL (Pollinations has URL length limits)
    const shortPrompt = prompt.length > 500 ? prompt.slice(0, 500) : prompt;
    const encodedPrompt = encodeURIComponent(shortPrompt);
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      model,
      nologo: 'true',
    });
    if (seed !== undefined) params.set('seed', String(seed));

    const pollinationsUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?${params}`;

    // Download the actual image (GET, not HEAD)
    const res = await fetch(pollinationsUrl, {
      headers: { 'User-Agent': 'MarionetteStudio/1.0' },
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      return { success: false, error: `Pollinations returned ${res.status}`, provider: 'pollinations' };
    }

    // Save locally
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) {
      return { success: false, error: 'Image too small (likely error response)', provider: 'pollinations' };
    }

    const fileName = `cut_${cutId || Date.now()}_${Math.floor(Math.random() * 9999)}.jpg`;
    const filePath = path.join(STORYBOARD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    const host = process.env.BACKEND_URL || 'http://localhost:3006';
    const imageUrl = `${host}/public/storyboard/images/${fileName}`;

    return { success: true, imageUrl, provider: 'pollinations' };
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
