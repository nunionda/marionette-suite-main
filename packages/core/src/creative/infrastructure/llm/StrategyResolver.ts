import { AnalysisStrategy, AnalysisStrategyName, CustomStrategyInput, ProviderChoice } from './AnalysisStrategy';
import { env } from '../../../shared/env';

function getDefaultProvider(): ProviderChoice {
  if (env.GEMINI_API_KEY) return 'gemini';
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
  if (env.OPENAI_API_KEY) return 'openai';
  return 'mock';
}

export function resolveStrategy(
  strategyName: AnalysisStrategyName,
  custom?: CustomStrategyInput,
): AnalysisStrategy {
  const defaultProvider = getDefaultProvider();

  switch (strategyName) {
    case 'fast':
      return {
        name: 'fast',
        engineProviders: {
          beatSheet: 'gemini',
          emotion: 'gemini',
          rating: 'gemini',
          roi: 'gemini',
          coverage: 'gemini',
        },
      };

    case 'deep':
      // High-complexity engines → Claude, medium-complexity → Gemini
      const deepReasoner: ProviderChoice = env.ANTHROPIC_API_KEY ? 'anthropic' : defaultProvider;
      const fastClassifier: ProviderChoice = env.GEMINI_API_KEY ? 'gemini' : defaultProvider;
      return {
        name: 'deep',
        engineProviders: {
          beatSheet: deepReasoner,
          emotion: deepReasoner,
          rating: fastClassifier,
          roi: fastClassifier,
          coverage: deepReasoner,
        },
      };

    case 'custom':
      return {
        name: 'custom',
        engineProviders: {
          beatSheet: custom?.beatSheet || defaultProvider,
          emotion: custom?.emotion || defaultProvider,
          rating: custom?.rating || defaultProvider,
          roi: custom?.roi || defaultProvider,
          coverage: custom?.coverage || defaultProvider,
        },
      };

    case 'auto':
    default:
      return {
        name: 'auto',
        engineProviders: {
          beatSheet: defaultProvider,
          emotion: defaultProvider,
          rating: defaultProvider,
          roi: defaultProvider,
          coverage: defaultProvider,
        },
      };
  }
}
