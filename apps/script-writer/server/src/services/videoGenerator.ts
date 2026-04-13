/**
 * Video Generator Service — generates short video clips via Pollinations.
 *
 * Downloads the video and saves locally for reliable browser playback.
 * Mirrors imageGenerator.ts pattern: fetch → save → return local URL.
 */

import fs from 'fs';
import path from 'path';

const POLLINATIONS_VIDEO_BASE = 'https://video.pollinations.ai/generate';
const VIDEO_DIR = path.join(process.cwd(), 'public', 'storyboard', 'videos');
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

export interface VideoGenResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  provider: string;
}

/**
 * Generate a short video clip from a text prompt.
 * Downloads to local server and returns a local URL.
 */
export async function generateVideo(prompt: string, options: {
  model?: string;
  cutId?: string;
} = {}): Promise<VideoGenResult> {
  const { model = 'fast-svd', cutId } = options;

  try {
    // Shorten and simplify prompt for URL (max 300 chars, English-friendly)
    const shortPrompt = prompt.length > 300 ? prompt.slice(0, 300) : prompt;
    const encodedPrompt = encodeURIComponent(shortPrompt);

    const url = `${POLLINATIONS_VIDEO_BASE}?prompt=${encodedPrompt}&model=${model}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'MarionetteStudio/1.0' },
      signal: AbortSignal.timeout(120000), // video gen takes longer
    });

    if (!res.ok) {
      return { success: false, error: `Pollinations Video returned ${res.status}`, provider: 'pollinations-video' };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) {
      return { success: false, error: 'Video too small (likely error response)', provider: 'pollinations-video' };
    }

    const fileName = `cut_${cutId || Date.now()}_${Math.floor(Math.random() * 9999)}.mp4`;
    const filePath = path.join(VIDEO_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    const host = process.env.BACKEND_URL || 'http://localhost:3006';
    const videoUrl = `${host}/public/storyboard/videos/${fileName}`;

    return { success: true, videoUrl, provider: 'pollinations-video' };
  } catch (e: any) {
    return { success: false, error: e.message, provider: 'pollinations-video' };
  }
}

/**
 * Build a concise English video prompt from cut data.
 * Keeps it short to avoid URL length issues with Pollinations.
 */
export function buildVideoPrompt(options: {
  description: string;
  cameraMove?: string;
}): string {
  const desc = options.description.slice(0, 200);
  const camera = options.cameraMove || 'slow zoom in';
  return `Cinematic video: ${desc}. Camera: ${camera}. Smooth motion, 24fps, film look, shallow DOF.`;
}
