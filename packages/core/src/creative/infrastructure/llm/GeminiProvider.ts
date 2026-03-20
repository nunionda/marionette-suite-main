import { GoogleGenAI } from '@google/genai';
import { env } from '../../../shared/env';
import { ILLMProvider, LLMResponse } from './ILLMProvider';

export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  private client: GoogleGenAI | null = null;

  // Model chain: each model has a separate free-tier quota
  private readonly modelChain = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
  ];

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } else {
      console.warn("⚠️ GEMINI_API_KEY is not set. GeminiProvider will be disabled.");
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    if (!this.client) {
      return { provider: this.name, model: 'none', content: '', latencyMs: 0, error: 'API Key missing' };
    }

    let lastError = '';

    for (const model of this.modelChain) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          },
        });

        return {
          provider: this.name,
          model,
          content: response.text || '',
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
          console.warn(`⚠️ Gemini ${model} rate-limited, trying next model...`);
          lastError = error.message;
          continue;
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
