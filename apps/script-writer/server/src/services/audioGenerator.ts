/**
 * Audio Generator Service — TTS and audio generation.
 *
 * Uses free TTS APIs for dialogue narration.
 * Future: BGM/SFX generation via free APIs.
 */

export interface AudioGenResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
  provider: string;
  duration?: number;
}

/**
 * Generate TTS audio from text using a free API.
 * Currently uses Google Translate TTS (free, no key needed, limited quality).
 */
export async function generateTTS(text: string, options: {
  lang?: string;
  voice?: string;
} = {}): Promise<AudioGenResult> {
  const { lang = 'ko' } = options;

  try {
    // Google Translate TTS — free but limited to ~200 chars
    const truncated = text.slice(0, 200);
    const encoded = encodeURIComponent(truncated);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encoded}&tl=${lang}`;

    return {
      success: true,
      audioUrl,
      provider: 'google-tts',
      duration: Math.ceil(text.length / 5), // rough estimate: 5 chars/sec for Korean
    };
  } catch (e: any) {
    return { success: false, error: e.message, provider: 'google-tts' };
  }
}

/**
 * Generate silence/placeholder audio for action cuts (no dialogue).
 */
export function generateSilence(durationSeconds: number): AudioGenResult {
  return {
    success: true,
    audioUrl: undefined, // No actual audio file needed for action cuts
    provider: 'silence',
    duration: durationSeconds,
  };
}
