import OpenAI from 'openai';
import { env } from '../../../shared/env';
import { ILLMProvider, LLMResponse } from './ILLMProvider';

export class OpenAIProvider implements ILLMProvider {
  readonly name = 'openai';
  private client: OpenAI | null = null;
  private readonly defaultModel = 'gpt-4o';

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    } else {
      console.warn("⚠️ OPENAI_API_KEY is not set. OpenAIProvider will be disabled.");
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      if (!this.client) throw new Error("API Key missing");

      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      });

      return {
        provider: this.name,
        model: this.defaultModel,
        content: response.choices[0]?.message?.content || "",
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
