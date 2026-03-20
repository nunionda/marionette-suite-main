export type AnalysisStrategyName = 'auto' | 'fast' | 'deep' | 'custom';

export type EngineName = 'beatSheet' | 'emotion' | 'rating' | 'roi' | 'coverage';

export type ProviderChoice = 'gemini' | 'anthropic' | 'openai' | 'mock';

export interface AnalysisStrategy {
  name: AnalysisStrategyName;
  engineProviders: Record<EngineName, ProviderChoice>;
}

export interface CustomStrategyInput {
  beatSheet?: ProviderChoice;
  emotion?: ProviderChoice;
  rating?: ProviderChoice;
  roi?: ProviderChoice;
  coverage?: ProviderChoice;
}
