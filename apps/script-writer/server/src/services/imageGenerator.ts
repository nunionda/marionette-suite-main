/**
 * Image Generator Service — generates photorealistic images via Pollinations FLUX.
 *
 * Used by Video Generation pipeline's image_gen node.
 * Downloads the image and saves locally for reliable serving.
 */

import fs from 'fs';
import path from 'path';
import { clampToFluxResolution, type VideoFormatPreset } from './videoFormats';

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
  formatPreset?: VideoFormatPreset;
} = {}): Promise<ImageGenResult> {
  // formatPreset이 있으면 FLUX 호환 해상도로 자동 변환
  const fluxSize = options.formatPreset
    ? clampToFluxResolution(options.formatPreset)
    : { width: options.width ?? 1024, height: options.height ?? 576 };
  const { seed, model = 'flux', cutId } = options;
  const { width, height } = fluxSize;

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

// ─── Category-aware prompt system ───

const CATEGORY_PREFIXES: Record<string, string> = {
  'YouTube':          'YouTube thumbnail style, vibrant high-contrast digital illustration,',
  'Commercial':       'Commercial advertisement still, clean product lifestyle photography,',
  'Netflix Original': 'Prestige TV drama still, cinematic series frame,',
  'Feature Film':     'Photorealistic cinematic film still,',
  'Short Film':       'Photorealistic cinematic film still,',
  'Drama':            'Korean TV drama still, cinematic series frame,',
};

const CATEGORY_SUFFIXES: Record<string, string> = {
  'YouTube':          'bold colors, face-forward, high energy, clean background, 8K digital.',
  'Commercial':       'brand-safe, lifestyle aesthetic, product hero, studio quality, 8K.',
  'Netflix Original': '8K, shallow depth of field, dramatic lighting, character-focused.',
  'Feature Film':     '8K, shallow depth of field, anamorphic lens, film grain, dramatic lighting.',
  'Short Film':       '8K, shallow depth of field, anamorphic lens, film grain, dramatic lighting.',
  'Drama':            '8K, warm color grade, character emotion, cinematic TV format.',
};

const DIRECTOR_MAP: Record<string, string> = {
  bong:      'Bong Joon-ho style, social realism',
  kubrick:   'Kubrick style, symmetry',
  miyazaki:  'Miyazaki style, hand-drawn animation',
  ridley:    'Ridley Scott style, epic scale',
  kurosawa:  'Kurosawa style, samurai drama',
  wes:       'Wes Anderson style, pastel symmetry',
  denis:     'Denis Villeneuve style, epic sci-fi',
  wong:      'Wong Kar-wai style, neon nostalgia',
  nolan:     'Nolan style, IMAX scale',
  tarantino: 'Tarantino style, bold framing',
};

const YOUTUBE_STYLE_MAP: Record<string, string> = {
  thumbnail:   'bright studio thumbnail, clickbait composition',
  reaction:    'reaction cam style, presenter facing camera, expressive face',
  vlog:        'natural lifestyle vlog frame, candid, warm tones',
  educational: 'clean explainer visual, whiteboard aesthetic, clear subject',
  gaming:      'dynamic gaming screenshot overlay style, vibrant HUD elements',
};

/**
 * Build an image prompt tailored to the project category.
 * Film/Drama projects use director-style modifiers; YouTube/Commercial use platform-specific styles.
 */
export function buildPromptByCategory(category: string, options: {
  description: string;
  style?: string;
  location?: string;
  characters?: string[];
  visualTone?: string;
}): string {
  const prefix = CATEGORY_PREFIXES[category] ?? CATEGORY_PREFIXES['Feature Film'];
  const suffix = CATEGORY_SUFFIXES[category] ?? CATEGORY_SUFFIXES['Feature Film'];

  const parts = [prefix, options.description];
  if (options.location) parts.push(`Location: ${options.location}.`);
  if (options.characters?.length) parts.push(`Characters: ${options.characters.join(', ')}.`);
  if (options.visualTone) parts.push(`Visual tone: ${options.visualTone}.`);

  if (options.style) {
    if (category === 'YouTube') {
      const ytPart = YOUTUBE_STYLE_MAP[options.style];
      if (ytPart) parts.push(ytPart + '.');
    } else if (!['Commercial'].includes(category)) {
      const directorPart = DIRECTOR_MAP[options.style];
      if (directorPart) parts.push(directorPart + '.');
    }
  }

  parts.push(suffix);
  return parts.join(' ');
}
