import { GoogleGenAI } from '@google/genai';
import { env } from '../../../shared/env';
import { ILLMProvider, LLMResponse } from './ILLMProvider';

export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  private client: GoogleGenAI | null = null;
  private readonly defaultModel = 'gemini-2.5-flash';

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } else {
      console.warn("⚠️ GEMINI_API_KEY is not set. GeminiProvider will be disabled.");
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      if (!this.client) throw new Error("API Key missing");

      // Gemini's SDK typically passes system instructions in the config
      const response = await this.client.models.generateContent({
        model: this.defaultModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2
        }
      });

      return {
        provider: this.name,
        model: this.defaultModel,
        content: response.text || "",
        latencyMs: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        provider: this.name,
        model: this.defaultModel,
        content: "",
        latencyMs: Date.now() - startTime,
        error: error.message
      };
    }
  }
}
