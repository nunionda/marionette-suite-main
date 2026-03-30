export interface LLMResponse {
  provider: string;
  model: string;
  content: string;
  latencyMs: number;
  error?: string;
}

export interface ILLMProvider {
  /** The unique name of the provider (e.g., 'gemini', 'anthropic', 'groq') */
  name: string;
  
  /**
   * Generates text based on the given prompts.
   * Can be instructed to output JSON via the systemPrompt.
   */
  generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse>;
}
