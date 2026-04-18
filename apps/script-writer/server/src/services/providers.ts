/**
 * Provider Abstraction Layer
 *
 * Centralizes all AI generation providers so switching between
 * free and paid APIs requires changing only this file.
 *
 * Current (free):
 *   Image: Pollinations FLUX
 *   Audio: Google TTS
 *   Video: Pollinations Video (experimental)
 *   Text:  Local / Ollama
 *
 * Future (paid):
 *   Image: Midjourney, DALL-E 3, Stable Diffusion
 *   Audio: ElevenLabs, OpenAI TTS
 *   Video: Runway, Kling, Sora
 *   Text:  Claude, GPT-4
 */

export type ProviderType = 'image' | 'video' | 'audio' | 'text';

export interface GenerationResult {
  success: boolean;
  url?: string;
  urls?: string[];
  text?: string;
  error?: string;
  provider: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  free: boolean;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
}

/* ─── Provider Registry ─── */

export const PROVIDERS: Record<string, ProviderConfig> = {
  // Image providers
  'pollinations-flux': {
    id: 'pollinations-flux', name: 'Pollinations FLUX', type: 'image',
    free: true, enabled: true, baseUrl: 'https://image.pollinations.ai/prompt',
  },
  'storyboard-concept': {
    id: 'storyboard-concept', name: 'Storyboard Concept Maker', type: 'image',
    free: true, enabled: true, baseUrl: (process.env.NEXT_PUBLIC_STORYBOARD_URL ?? "http://localhost:3007"),
  },
  'midjourney': {
    id: 'midjourney', name: 'Midjourney', type: 'image',
    free: false, enabled: false,
  },
  'dalle3': {
    id: 'dalle3', name: 'DALL-E 3', type: 'image',
    free: false, enabled: false,
  },

  // Video providers
  'pollinations-video': {
    id: 'pollinations-video', name: 'Pollinations Video', type: 'video',
    free: true, enabled: true, baseUrl: 'https://video.pollinations.ai',
  },
  'runway': {
    id: 'runway', name: 'Runway Gen-3', type: 'video',
    free: false, enabled: false,
  },
  'kling': {
    id: 'kling', name: 'Kling AI', type: 'video',
    free: false, enabled: false,
  },

  // Audio providers
  'google-tts': {
    id: 'google-tts', name: 'Google TTS', type: 'audio',
    free: true, enabled: true,
  },
  'elevenlabs': {
    id: 'elevenlabs', name: 'ElevenLabs', type: 'audio',
    free: false, enabled: false,
  },
  'openai-tts': {
    id: 'openai-tts', name: 'OpenAI TTS', type: 'audio',
    free: false, enabled: false,
  },

  // Text/LLM providers
  'ollama': {
    id: 'ollama', name: 'Ollama (Local)', type: 'text',
    free: true, enabled: true, baseUrl: 'http://localhost:11434',
  },
  'gemini-free': {
    id: 'gemini-free', name: 'Gemini Free', type: 'text',
    free: true, enabled: true,
  },
  'claude': {
    id: 'claude', name: 'Anthropic Claude', type: 'text',
    free: false, enabled: false, // Enable when credits available
  },
};

/* ─── Provider Selection ─── */

/**
 * Get the active provider for a given type.
 * Returns the first enabled provider, preferring free ones.
 */
export function getActiveProvider(type: ProviderType): ProviderConfig | null {
  const candidates = Object.values(PROVIDERS)
    .filter(p => p.type === type && p.enabled)
    .sort((a, b) => (a.free === b.free ? 0 : a.free ? -1 : 1));
  return candidates[0] || null;
}

/**
 * Get all providers for a given type.
 */
export function getProvidersByType(type: ProviderType): ProviderConfig[] {
  return Object.values(PROVIDERS).filter(p => p.type === type);
}

/**
 * Enable/disable a provider.
 */
export function setProviderEnabled(providerId: string, enabled: boolean, apiKey?: string): void {
  const provider = PROVIDERS[providerId];
  if (provider) {
    provider.enabled = enabled;
    if (apiKey) provider.apiKey = apiKey;
  }
}

/**
 * Get provider status summary for UI display.
 */
export function getProviderStatus(): Record<ProviderType, { active: string; available: string[] }> {
  const types: ProviderType[] = ['image', 'video', 'audio', 'text'];
  const status: Record<string, any> = {};
  for (const type of types) {
    const active = getActiveProvider(type);
    const available = getProvidersByType(type).map(p => `${p.name}${p.enabled ? ' ✓' : ''}${p.free ? ' (free)' : ' ($)'}`);
    status[type] = { active: active?.name || 'none', available };
  }
  return status as any;
}
