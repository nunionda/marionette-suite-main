import type { AnalysisStrategy, AnalysisStrategyName, CustomStrategyInput, ProviderChoice } from './AnalysisStrategy';
import { env } from '../../../shared/env';

function getDefaultProvider(): ProviderChoice {
  // Priority: Gemini Free → Ollama (local) → HuggingFace → Groq Free → Anthropic (credits) → Mock
  if (env.GEMINI_API_KEY) return 'gemini';
  if (env.OLLAMA_BASE_URL) return 'ollama';
  if (env.HUGGINGFACE_API_KEY) return 'huggingface';
  if (env.GROQ_API_KEY) return 'groq';
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
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
          vfx: 'gemini',
          trope: 'gemini',
        },
      };

    case 'deep': {
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
          vfx: fastClassifier,
          trope: fastClassifier,
        },
      };
    }

    case 'budget': {
      // Zero-cost: Groq free tier + Ollama local fallback
      const freeProvider: ProviderChoice = env.GROQ_API_KEY ? 'groq' : (env.OLLAMA_BASE_URL ? 'ollama' : defaultProvider);
      return {
        name: 'budget',
        engineProviders: {
          beatSheet: freeProvider,
          emotion: freeProvider,
          rating: freeProvider,
          roi: freeProvider,
          coverage: freeProvider,
          vfx: freeProvider,
          trope: freeProvider,
        },
      };
    }

    case 'premium': {
      const premiumCreative: ProviderChoice = env.ANTHROPIC_API_KEY ? 'anthropic' : defaultProvider;
      const premiumClassifier: ProviderChoice = env.GEMINI_API_KEY ? 'gemini' : defaultProvider;
      return {
        name: 'premium',
        engineProviders: {
          beatSheet: premiumCreative,
          emotion: premiumCreative,
          rating: premiumClassifier,
          roi: premiumCreative,
          coverage: premiumCreative,
          vfx: premiumClassifier,
          trope: premiumCreative,
        },
      };
    }

    case 'long-context': {
      const longCtx: ProviderChoice = env.GEMINI_API_KEY ? 'gemini-long' : defaultProvider;
      const standard: ProviderChoice = env.GEMINI_API_KEY ? 'gemini' : defaultProvider;
      const reasoning: ProviderChoice = env.OLLAMA_BASE_URL ? 'ollama' : standard;
      return {
        name: 'long-context',
        engineProviders: {
          beatSheet: longCtx,
          emotion: longCtx,
          rating: standard,
          roi: reasoning,
          coverage: longCtx,
          vfx: standard,
          trope: env.ANTHROPIC_API_KEY ? 'anthropic' : standard,
        },
      };
    }

    case 'custom':
      return {
        name: 'custom',
        engineProviders: {
          beatSheet: custom?.beatSheet ?? defaultProvider,
          emotion: custom?.emotion ?? defaultProvider,
          rating: custom?.rating ?? defaultProvider,
          roi: custom?.roi ?? defaultProvider,
          coverage: custom?.coverage ?? defaultProvider,
          vfx: custom?.vfx ?? defaultProvider,
          trope: custom?.trope ?? defaultProvider,
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
          vfx: defaultProvider,
          trope: defaultProvider,
        },
      };
  }
}
