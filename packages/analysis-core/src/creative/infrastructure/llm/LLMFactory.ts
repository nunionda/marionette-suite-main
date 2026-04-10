import type { ILLMProvider, LLMResponse } from './ILLMProvider';
import type { ProviderChoice } from './AnalysisStrategy';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { GroqProvider } from './GroqProvider';
import { OllamaProvider } from './OllamaProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { MockProvider } from './MockProvider';

export class LLMFactory {
  private providers: Map<string, ILLMProvider> = new Map();

  constructor() {
    this.providers.set('gemini', new GeminiProvider('standard'));
    this.providers.set('gemini-pro', new GeminiProvider('pro'));
    this.providers.set('gemini-long', new GeminiProvider('long-context'));
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('huggingface', new HuggingFaceProvider());
    this.providers.set('groq', new GroqProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('mock', new MockProvider());
  }

  getProvider(name: ProviderChoice): ILLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} is not registered.`);
    }
    return provider;
  }

  async runEnsemble(systemPrompt: string, userPrompt: string): Promise<LLMResponse[]> {
    const activeProviders = Array.from(this.providers.values());
    const promises = activeProviders.map(provider =>
      provider.generateText(systemPrompt, userPrompt)
    );
    return Promise.all(promises);
  }
}
