import { GoogleGenAI } from '@google/genai';
import { env } from '../../../shared/env';
import type { ILLMProvider, LLMResponse } from './ILLMProvider';

export type GeminiTier = 'standard' | 'pro' | 'long-context';

const MODEL_CHAINS: Record<GeminiTier, string[]> = {
  standard: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'],
  pro: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  'long-context': ['gemini-1.5-pro', 'gemini-2.5-pro', 'gemini-2.5-flash'],
};

export class GeminiProvider implements ILLMProvider {
  readonly name: string;
  private client: GoogleGenAI | null = null;
  private readonly modelChain: string[];

  // Retry config
  private readonly maxRetries = 2;
  private readonly baseDelayMs = 5000;

  constructor(tier: GeminiTier = 'standard') {
    const TIER_NAMES: Record<GeminiTier, string> = {
      standard: 'gemini',
      pro: 'gemini-pro',
      'long-context': 'gemini-long',
    };
    this.name = TIER_NAMES[tier];
    this.modelChain = MODEL_CHAINS[tier];

    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } else {
      console.warn("⚠️ GEMINI_API_KEY is not set. GeminiProvider will be disabled.");
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    if (!this.client) {
      return { provider: this.name, model: 'none', content: '', latencyMs: 0, error: 'API Key missing' };
    }

    let lastError = '';

    for (const model of this.modelChain) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const response = await this.client.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.2,
            },
          });

          // Gemini often wraps JSON in markdown code fences — strip them
          let content = (response.text || '').trim();
          if (content.startsWith('```')) {
            content = content.replace(/^```(?:\w*)\s*\n?/, '').replace(/\n?```\s*$/, '');
          }

          return {
            provider: this.name,
            model,
            content,
            latencyMs: Date.now() - startTime,
          };
        } catch (error: any) {
          const isRateLimit =
            error?.status === 429 ||
            error?.httpStatusCode === 429 ||
            error?.code === 429 ||
            error.message?.includes('429') ||
            error.message?.includes('RESOURCE_EXHAUSTED');

          if (isRateLimit) {
            if (attempt < this.maxRetries) {
              const delay = this.baseDelayMs * Math.pow(2, attempt);
              console.warn(`⚠️ Gemini ${model} rate-limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${this.maxRetries})...`);
              await this.sleep(delay);
              continue;
            }
            console.warn(`⚠️ Gemini ${model} rate-limited after ${this.maxRetries} retries, trying next model...`);
            lastError = error.message;
            break; // Move to next model
          }

          // Non-rate-limit error: fail immediately
          return {
            provider: this.name,
            model,
            content: '',
            latencyMs: Date.now() - startTime,
            error: error.message,
          };
        }
      }
    }

    // All models exhausted
    return {
      provider: this.name,
      model: 'all-exhausted',
      content: '',
      latencyMs: Date.now() - startTime,
      error: `All Gemini models rate-limited. ${lastError}`,
    };
  }
}
