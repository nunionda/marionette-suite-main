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

    const params = new URLSearchParams({ prompt: shortPrompt, model });
    const url = `${POLLINATIONS_VIDEO_BASE}?${params}`;

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

const CATEGORY_VIDEO_STYLE: Record<string, string> = {
  'YouTube':          'fast-cut dynamic edit, high contrast, face-forward energy',
  'Commercial':       'smooth brand commercial look, aspirational lifestyle motion',
  'Netflix Original': 'prestige TV drama pacing, emotional close-ups, cinematic depth',
  'Feature Film':     'filmic 24fps grain, anamorphic bokeh, immersive depth',
  'Short Film':       'filmic 24fps grain, anamorphic bokeh, immersive depth',
  'Drama':            'Korean drama warm grade, intimate handheld movement, golden hour',
};

const CAMERA_MOVES: Record<string, string> = {
  closeup:   'slow push in on face',
  wide:      'gentle crane reveal, pulling back to establish',
  action:    'handheld follow, rapid direction changes',
  dramatic:  'low angle slow zoom with dutch tilt',
  dialogue:  'subtle rack focus between subjects',
  aerial:    'sweeping drone arc overhead',
};

/**
 * Build a concise English video prompt from cut data.
 * Category-aware style + shot-type camera movement.
 */
export function buildVideoPrompt(options: {
  description: string;
  cameraMove?: string;
  category?: string;
  shotType?: string;
}): string {
  const desc = options.description.slice(0, 200);
  const styleNote = CATEGORY_VIDEO_STYLE[options.category || ''] || 'cinematic film look';
  const camera = options.cameraMove
    || CAMERA_MOVES[options.shotType || '']
    || 'slow cinematic zoom';
  return `Cinematic video clip: ${desc}. Camera: ${camera}. Style: ${styleNote}. Smooth motion, 24fps, shallow DOF, professional color grade.`;
}
