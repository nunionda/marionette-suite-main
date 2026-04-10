# Free LLM Provider Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all paid LLM providers (OpenAI, DeepSeek) and replace with free alternatives (Ollama local, HuggingFace free Inference API), updating the provider chain across both `production_pipeline` and `cine-analysys-system`.

**Architecture:** Surgical file-level replacement — two new provider classes follow the existing `ILLMProvider` / `TextProvider` interfaces, replacing OpenAI and DeepSeek. The StrategyResolver priority chain becomes: Gemini Free → Ollama → HuggingFace → Groq Free → Anthropic → Mock. Both repos share near-identical LLM infrastructure and receive the same changes.

**Tech Stack:** Bun, TypeScript (strict), `bun:test`, native `fetch` (no new SDK dependencies)

---

## File Map

### production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/

| Action | File | Purpose |
|--------|------|---------|
| Create | `OllamaProvider.ts` | Calls Ollama REST `/v1/chat/completions` (local, no key) |
| Create | `HuggingFaceProvider.ts` | Calls HF free Inference API chat completions |
| Modify | `LLMFactory.ts` | Remove openai/deepseek, register ollama/huggingface |
| Modify | `LLMFactory.test.ts` | Remove openai/deepseek assertions, add ollama/huggingface |
| Modify | `AnalysisStrategy.ts` | Remove `'openai'` and `'deepseek'` from `ProviderChoice` |
| Modify | `StrategyResolver.ts` | New free-first default chain, update budget/long-context strategies |
| **Delete** | `OpenAIProvider.ts` | Paid provider — removed |
| **Delete** | `DeepSeekProvider.ts` | Paid provider — removed |

### production_pipeline/packages/scenario-core/src/shared/

| Action | File | Purpose |
|--------|------|---------|
| Modify | `env.ts` | Remove OPENAI_API_KEY/DEEPSEEK_API_KEY, add HUGGINGFACE_API_KEY/OLLAMA_BASE_URL |

### production_pipeline/packages/ai-gateway/src/providers/

| Action | File | Purpose |
|--------|------|---------|
| Create | `ollama.ts` | Implements `TextProvider` for ai-gateway layer |
| Create | `huggingface.ts` | Implements `TextProvider` for ai-gateway layer |
| Modify | `index.ts` | Remove OpenAI export, add Ollama + HuggingFace exports |
| **Delete** | `openai.ts` | Paid provider — removed |

### production_pipeline/packages/ai-gateway/src/

| Action | File | Purpose |
|--------|------|---------|
| Modify | `index.ts` | Remove `OpenAIProvider` from public exports |

### production_pipeline/ (root)

| Action | File | Purpose |
|--------|------|---------|
| Modify | `.env.example` | Remove OPENAI_API_KEY, add OLLAMA_BASE_URL + HUGGINGFACE_API_KEY |

### cine-analysys-system/packages/core/src/creative/infrastructure/llm/ (mirror of scenario-core)

Same create/modify/delete operations as scenario-core above.

### cine-analysys-system/packages/core/src/shared/

Same env.ts changes as scenario-core above.

---

## Task 1: Add OllamaProvider to production_pipeline scenario-core

**Files:**
- Create: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.ts`

- [ ] **Step 1: Write the failing test**

Add a new test file alongside the existing `LLMFactory.test.ts`:

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.test.ts
import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { OllamaProvider } from './OllamaProvider';

describe('OllamaProvider', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(async (_url: string, _opts: RequestInit) => {
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'hello from ollama' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('name is "ollama"', () => {
    const provider = new OllamaProvider();
    expect(provider.name).toBe('ollama');
  });

  test('generateText returns content from response', async () => {
    const provider = new OllamaProvider();
    const result = await provider.generateText('You are a helper.', 'Say hello.');
    expect(result.provider).toBe('ollama');
    expect(result.content).toBe('hello from ollama');
    expect(result.error).toBeUndefined();
  });

  test('generateText returns error on network failure', async () => {
    globalThis.fetch = mock(async () => { throw new Error('connection refused'); }) as unknown as typeof fetch;
    const provider = new OllamaProvider();
    const result = await provider.generateText('sys', 'user');
    expect(result.content).toBe('');
    expect(result.error).toContain('connection refused');
  });

  test('calls correct endpoint with correct body', async () => {
    let capturedUrl = '';
    let capturedBody: unknown = null;
    globalThis.fetch = mock(async (url: string, opts: RequestInit) => {
      capturedUrl = url;
      capturedBody = JSON.parse(opts.body as string);
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const provider = new OllamaProvider();
    await provider.generateText('sys prompt', 'user prompt');

    expect(capturedUrl).toBe('http://localhost:11434/v1/chat/completions');
    expect((capturedBody as any).messages).toEqual([
      { role: 'system', content: 'sys prompt' },
      { role: 'user', content: 'user prompt' },
    ]);
    expect((capturedBody as any).stream).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.test.ts
```

Expected: FAIL — `Cannot find module './OllamaProvider'`

- [ ] **Step 3: Implement OllamaProvider**

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.ts
import type { ILLMProvider, LLMResponse } from './ILLMProvider';

const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export class OllamaProvider implements ILLMProvider {
  readonly name = 'ollama';
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env['OLLAMA_BASE_URL'] ?? DEFAULT_BASE_URL;
    this.model = process.env['OLLAMA_MODEL'] ?? DEFAULT_MODEL;
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama error (${response.status}): ${err}`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      return {
        provider: this.name,
        model: this.model,
        content: data.choices[0]?.message?.content ?? '',
        latencyMs: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        provider: this.name,
        model: this.model,
        content: '',
        latencyMs: Date.now() - startTime,
        error: message,
      };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.test.ts
```

Expected: all 4 tests PASS

---

## Task 2: Add HuggingFaceProvider to production_pipeline scenario-core

**Files:**
- Create: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.ts`
- Create: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.test.ts
import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { HuggingFaceProvider } from './HuggingFaceProvider';

describe('HuggingFaceProvider', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env['HUGGINGFACE_API_KEY'];

  beforeEach(() => {
    process.env['HUGGINGFACE_API_KEY'] = 'hf_test_token';
    globalThis.fetch = mock(async (_url: string, _opts: RequestInit) => {
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'hello from hf' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnv === undefined) {
      delete process.env['HUGGINGFACE_API_KEY'];
    } else {
      process.env['HUGGINGFACE_API_KEY'] = originalEnv;
    }
  });

  test('name is "huggingface"', () => {
    const provider = new HuggingFaceProvider();
    expect(provider.name).toBe('huggingface');
  });

  test('generateText returns content from response', async () => {
    const provider = new HuggingFaceProvider();
    const result = await provider.generateText('You are a helper.', 'Say hello.');
    expect(result.provider).toBe('huggingface');
    expect(result.content).toBe('hello from hf');
    expect(result.error).toBeUndefined();
  });

  test('generateText returns error on API failure', async () => {
    globalThis.fetch = mock(async () => {
      return new Response('{"error":"Model is loading"}', { status: 503 });
    }) as unknown as typeof fetch;
    const provider = new HuggingFaceProvider();
    const result = await provider.generateText('sys', 'user');
    expect(result.content).toBe('');
    expect(result.error).toContain('503');
  });

  test('calls correct HF endpoint with Authorization header', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = mock(async (url: string, opts: RequestInit) => {
      capturedUrl = url;
      capturedHeaders = opts.headers as Record<string, string>;
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const provider = new HuggingFaceProvider();
    await provider.generateText('sys', 'user');

    expect(capturedUrl).toContain('api-inference.huggingface.co');
    expect(capturedHeaders['Authorization']).toBe('Bearer hf_test_token');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.test.ts
```

Expected: FAIL — `Cannot find module './HuggingFaceProvider'`

- [ ] **Step 3: Implement HuggingFaceProvider**

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.ts
import type { ILLMProvider, LLMResponse } from './ILLMProvider';

const HF_BASE = 'https://api-inference.huggingface.co';
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export class HuggingFaceProvider implements ILLMProvider {
  readonly name = 'huggingface';
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env['HUGGINGFACE_API_KEY'];
    this.model = process.env['HUGGINGFACE_MODEL'] ?? DEFAULT_MODEL;
    if (!this.apiKey) {
      console.warn('⚠️ HUGGINGFACE_API_KEY not set — running without auth (strict rate limits apply).');
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

      const response = await fetch(`${HF_BASE}/models/${this.model}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`HuggingFace error (${response.status}): ${err}`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      return {
        provider: this.name,
        model: this.model,
        content: data.choices[0]?.message?.content ?? '',
        latencyMs: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        provider: this.name,
        model: this.model,
        content: '',
        latencyMs: Date.now() - startTime,
        error: message,
      };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.test.ts
```

Expected: all 4 tests PASS

---

## Task 3: Update LLMFactory, AnalysisStrategy, StrategyResolver, env.ts (production_pipeline)

**Files:**
- Modify: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/LLMFactory.ts`
- Modify: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/LLMFactory.test.ts`
- Modify: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/AnalysisStrategy.ts`
- Modify: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/StrategyResolver.ts`
- Modify: `production_pipeline/packages/scenario-core/src/shared/env.ts`

- [ ] **Step 1: Update LLMFactory.test.ts to remove old providers and add new ones**

Replace the full content of the existing test file:

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/LLMFactory.test.ts
import { describe, expect, test } from 'bun:test';
import { LLMFactory } from './LLMFactory';

describe('LLMFactory', () => {
  const factory = new LLMFactory();

  test('registers all free providers', () => {
    const gemini = factory.getProvider('gemini');
    const geminiPro = factory.getProvider('gemini-pro');
    const geminiLong = factory.getProvider('gemini-long');
    const ollama = factory.getProvider('ollama');
    const huggingface = factory.getProvider('huggingface');
    const groq = factory.getProvider('groq');
    const anthropic = factory.getProvider('anthropic');
    const mock = factory.getProvider('mock');

    expect(gemini.name).toBe('gemini');
    expect(geminiPro.name).toBe('gemini-pro');
    expect(geminiLong.name).toBe('gemini-long');
    expect(ollama.name).toBe('ollama');
    expect(huggingface.name).toBe('huggingface');
    expect(groq.name).toBe('groq');
    expect(anthropic.name).toBe('anthropic');
    expect(mock.name).toBe('mock');
  });

  test('throws for unknown provider', () => {
    expect(() => factory.getProvider('unknown' as any)).toThrow('Provider unknown is not registered');
  });

  test('does NOT register openai or deepseek', () => {
    expect(() => factory.getProvider('openai' as any)).toThrow();
    expect(() => factory.getProvider('deepseek' as any)).toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails (openai/deepseek still registered)**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/scenario-core/src/creative/infrastructure/llm/LLMFactory.test.ts
```

Expected: FAIL — `openai` and `deepseek` still found

- [ ] **Step 3: Update env.ts — remove paid keys, add free provider config**

Replace the full content of `packages/scenario-core/src/shared/env.ts`:

```typescript
import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  // External APIs — free-tier only
  TMDB_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),   // remaining credits only
  HUGGINGFACE_API_KEY: z.string().optional(), // free tier
  OLLAMA_BASE_URL: z.string().url().optional(), // local Ollama server
  KOFIC_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 4: Update AnalysisStrategy.ts — remove openai and deepseek from ProviderChoice**

Replace the full content:

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/AnalysisStrategy.ts
export type AnalysisStrategyName = 'auto' | 'fast' | 'deep' | 'custom' | 'budget' | 'premium' | 'long-context';

export type EngineName = 'beatSheet' | 'emotion' | 'rating' | 'roi' | 'coverage' | 'vfx' | 'trope';

export type ProviderChoice = 'gemini' | 'gemini-pro' | 'gemini-long' | 'anthropic' | 'ollama' | 'huggingface' | 'groq' | 'mock';

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
  vfx?: ProviderChoice;
  trope?: ProviderChoice;
}
```

- [ ] **Step 5: Update StrategyResolver.ts — new free-first chain**

Replace the full content:

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/StrategyResolver.ts
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
      // Best quality: Anthropic for creative, Gemini for classification
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
      // Ultra-long scripts: Gemini 1.5 Pro (2M context) + Ollama for reasoning
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
```

- [ ] **Step 6: Update LLMFactory.ts — remove paid providers, add free ones**

Replace the full content:

```typescript
// production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/LLMFactory.ts
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
```

- [ ] **Step 7: Run all scenario-core LLM tests**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/scenario-core/src/creative/infrastructure/llm/
```

Expected: OllamaProvider (4 pass), HuggingFaceProvider (4 pass), LLMFactory (3 pass)

---

## Task 4: Delete paid provider files from production_pipeline scenario-core

**Files:**
- Delete: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OpenAIProvider.ts`
- Delete: `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/DeepSeekProvider.ts`

- [ ] **Step 1: Delete both files**

```bash
rm /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OpenAIProvider.ts
rm /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/DeepSeekProvider.ts
```

- [ ] **Step 2: Verify no remaining imports of the deleted files**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
grep -r "OpenAIProvider\|DeepSeekProvider\|OPENAI_API_KEY\|DEEPSEEK_API_KEY" packages/scenario-core/src/ --include="*.ts"
```

Expected: no output (zero matches)

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun run typecheck
```

Expected: zero errors

- [ ] **Step 4: Commit production_pipeline scenario-core changes**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
git add packages/scenario-core/src/creative/infrastructure/llm/ packages/scenario-core/src/shared/env.ts
git commit -m "feat(scenario-core): replace paid LLM providers with free alternatives

- Add OllamaProvider (local REST, no API key)
- Add HuggingFaceProvider (free Inference API)
- Remove OpenAIProvider and DeepSeekProvider
- Update LLMFactory, AnalysisStrategy, StrategyResolver
- New chain: Gemini Free → Ollama → HuggingFace → Groq → Anthropic → Mock
- Remove OPENAI_API_KEY and DEEPSEEK_API_KEY from env schema"
```

---

## Task 5: Mirror changes to cine-analysys-system

**Files:** Same file set under `cine-analysys-system/packages/core/src/creative/infrastructure/llm/` and `cine-analysys-system/packages/core/src/shared/env.ts`

- [ ] **Step 1: Copy new provider files**

```bash
cp /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.ts \
   /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/core/src/creative/infrastructure/llm/OllamaProvider.ts

cp /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/OllamaProvider.test.ts \
   /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/core/src/creative/infrastructure/llm/OllamaProvider.test.ts

cp /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.ts \
   /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/core/src/creative/infrastructure/llm/HuggingFaceProvider.ts

cp /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/HuggingFaceProvider.test.ts \
   /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/core/src/creative/infrastructure/llm/HuggingFaceProvider.test.ts
```

- [ ] **Step 2: Replace LLMFactory.ts**

```typescript
// cine-analysys-system/packages/core/src/creative/infrastructure/llm/LLMFactory.ts
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
```

- [ ] **Step 3: Replace AnalysisStrategy.ts**

```typescript
// cine-analysys-system/packages/core/src/creative/infrastructure/llm/AnalysisStrategy.ts
export type AnalysisStrategyName = 'auto' | 'fast' | 'deep' | 'custom' | 'budget' | 'premium' | 'long-context';

export type EngineName = 'beatSheet' | 'emotion' | 'rating' | 'roi' | 'coverage' | 'vfx' | 'trope';

export type ProviderChoice = 'gemini' | 'gemini-pro' | 'gemini-long' | 'anthropic' | 'ollama' | 'huggingface' | 'groq' | 'mock';

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
  vfx?: ProviderChoice;
  trope?: ProviderChoice;
}
```

- [ ] **Step 4: Replace StrategyResolver.ts (same as production_pipeline)**

Write the exact same content as `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/StrategyResolver.ts` from Task 3 Step 5.

- [ ] **Step 5: Replace env.ts**

Write the exact same content as `production_pipeline/packages/scenario-core/src/shared/env.ts` from Task 3 Step 3.

- [ ] **Step 6: Replace LLMFactory.test.ts**

```typescript
// cine-analysys-system/packages/core/src/creative/infrastructure/llm/LLMFactory.test.ts
import { describe, expect, test } from 'bun:test';
import { LLMFactory } from './LLMFactory';

describe('LLMFactory', () => {
  const factory = new LLMFactory();

  test('registers all free providers', () => {
    expect(factory.getProvider('gemini').name).toBe('gemini');
    expect(factory.getProvider('gemini-pro').name).toBe('gemini-pro');
    expect(factory.getProvider('gemini-long').name).toBe('gemini-long');
    expect(factory.getProvider('ollama').name).toBe('ollama');
    expect(factory.getProvider('huggingface').name).toBe('huggingface');
    expect(factory.getProvider('groq').name).toBe('groq');
    expect(factory.getProvider('anthropic').name).toBe('anthropic');
    expect(factory.getProvider('mock').name).toBe('mock');
  });

  test('does NOT register openai or deepseek', () => {
    expect(() => factory.getProvider('openai' as any)).toThrow();
    expect(() => factory.getProvider('deepseek' as any)).toThrow();
  });
});
```

- [ ] **Step 7: Delete paid provider files**

```bash
rm /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/core/src/creative/infrastructure/llm/OpenAIProvider.ts
rm /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/core/src/creative/infrastructure/llm/DeepSeekProvider.ts
```

- [ ] **Step 8: Run tests in cine-analysys-system**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system
bun test packages/core/src/creative/infrastructure/llm/
```

Expected: all tests PASS

- [ ] **Step 9: Check for remaining paid API references**

```bash
grep -r "OpenAIProvider\|DeepSeekProvider\|OPENAI_API_KEY\|DEEPSEEK_API_KEY" \
  /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system/packages/ \
  --include="*.ts"
```

Expected: no output

- [ ] **Step 10: Commit cine-analysys-system changes**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/cine-analysys-system
git add packages/core/src/creative/infrastructure/llm/ packages/core/src/shared/env.ts
git commit -m "feat(core): replace paid LLM providers with free alternatives

Mirrors production_pipeline/packages/scenario-core changes:
- Add OllamaProvider, HuggingFaceProvider
- Remove OpenAIProvider, DeepSeekProvider
- New chain: Gemini Free → Ollama → HuggingFace → Groq → Anthropic → Mock"
```

---

## Task 6: Update ai-gateway (add Ollama + HuggingFace, remove OpenAI)

**Files:**
- Create: `production_pipeline/packages/ai-gateway/src/providers/ollama.ts`
- Create: `production_pipeline/packages/ai-gateway/src/providers/huggingface.ts`
- Modify: `production_pipeline/packages/ai-gateway/src/providers/index.ts`
- Modify: `production_pipeline/packages/ai-gateway/src/index.ts`
- Delete: `production_pipeline/packages/ai-gateway/src/providers/openai.ts`

- [ ] **Step 1: Create providers/ollama.ts**

```typescript
// production_pipeline/packages/ai-gateway/src/providers/ollama.ts
// ---------------------------------------------------------------------------
// OllamaProvider — wraps local Ollama server for text generation (free, no key)
// Requires Ollama running: https://ollama.ai
// ---------------------------------------------------------------------------

import type { TextProvider, TextOptions } from "../types.js"

const DEFAULT_BASE_URL = "http://localhost:11434"
const DEFAULT_MODEL = "llama3.2"

interface ChatCompletionResponse {
  choices: { message: { content: string } }[]
}

export class OllamaProvider implements TextProvider {
  private readonly baseUrl: string
  private readonly model: string

  constructor() {
    this.baseUrl = process.env["OLLAMA_BASE_URL"] ?? DEFAULT_BASE_URL
    this.model = process.env["OLLAMA_MODEL"] ?? DEFAULT_MODEL
  }

  async generateText(prompt: string, options?: TextOptions): Promise<string> {
    const messages: { role: string; content: string }[] = []
    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt })
    }
    messages.push({ role: "user", content: prompt })

    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        stream: false,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`[Ollama] Request failed (${res.status}): ${err}`)
    }

    const data = (await res.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("[Ollama] Empty response")
    return content
  }
}
```

- [ ] **Step 2: Create providers/huggingface.ts**

```typescript
// production_pipeline/packages/ai-gateway/src/providers/huggingface.ts
// ---------------------------------------------------------------------------
// HuggingFaceProvider — wraps HuggingFace free Inference API for text generation
// Token optional but strongly recommended: https://huggingface.co/settings/tokens
// ---------------------------------------------------------------------------

import type { TextProvider, TextOptions } from "../types.js"

const HF_BASE = "https://api-inference.huggingface.co"
const DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

interface ChatCompletionResponse {
  choices: { message: { content: string } }[]
}

export class HuggingFaceProvider implements TextProvider {
  private readonly apiKey: string | undefined
  private readonly model: string

  constructor() {
    this.apiKey = process.env["HUGGINGFACE_API_KEY"]
    this.model = process.env["HUGGINGFACE_MODEL"] ?? DEFAULT_MODEL
    if (!this.apiKey) {
      console.warn(
        "[HuggingFaceProvider] HUGGINGFACE_API_KEY not set — " +
          "running without auth (strict rate limits apply).",
      )
    }
  }

  async generateText(prompt: string, options?: TextOptions): Promise<string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`

    const messages: { role: string; content: string }[] = []
    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt })
    }
    messages.push({ role: "user", content: prompt })

    const res = await fetch(`${HF_BASE}/models/${this.model}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`[HuggingFace] Request failed (${res.status}): ${err}`)
    }

    const data = (await res.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("[HuggingFace] Empty response")
    return content
  }
}
```

- [ ] **Step 3: Update providers/index.ts — remove OpenAI, add Ollama + HuggingFace**

Replace the full content:

```typescript
// production_pipeline/packages/ai-gateway/src/providers/index.ts
export { GeminiProvider } from "./gemini.js"
export { SunoProvider } from "./suno.js"
export { ReplicateProvider } from "./replicate.js"
export { MusicGenProvider } from "./musicgen.js"
export { EdgeTTSProvider } from "./edge-tts.js"
export { OllamaProvider } from "./ollama.js"
export { HuggingFaceProvider } from "./huggingface.js"
```

- [ ] **Step 4: Update src/index.ts — remove OpenAI from public exports**

Replace the full content:

```typescript
// production_pipeline/packages/ai-gateway/src/index.ts
export { AIGateway } from "./gateway.js"
export { GeminiProvider, OllamaProvider, HuggingFaceProvider } from "./providers/index.js"

export type {
  TextOptions,
  ImageOptions,
  VideoOptions,
  AudioOptions,
  TTSOptions,
  VideoResult,
  TextProvider,
  ImageProvider,
  VideoProvider,
  AudioProvider,
  TTSProvider,
} from "./types.js"
```

- [ ] **Step 5: Delete openai.ts**

```bash
rm /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline/packages/ai-gateway/src/providers/openai.ts
```

- [ ] **Step 6: Run ai-gateway tests**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun test packages/ai-gateway/
```

Expected: all tests PASS (existing gateway.test.ts uses mock providers, not affected)

- [ ] **Step 7: Run typecheck**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
bun run typecheck
```

Expected: zero errors

- [ ] **Step 8: Commit ai-gateway changes**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
git add packages/ai-gateway/
git commit -m "feat(ai-gateway): replace OpenAIProvider with OllamaProvider and HuggingFaceProvider

- Add OllamaProvider (TextProvider, uses local Ollama REST API)
- Add HuggingFaceProvider (TextProvider, uses HF free Inference API)
- Remove OpenAIProvider
- Update providers/index.ts and src/index.ts exports"
```

---

## Task 7: Update .env.example

**Files:**
- Modify: `production_pipeline/.env.example`

- [ ] **Step 1: Replace .env.example content**

```
# ─── Marionette Studios — Environment Configuration ───────────────────────────
# Provider chain: Gemini Free → Ollama → HuggingFace → Groq Free → Anthropic → Mock

# ─── Auth / Infrastructure ────────────────────────────────────────────────────
JWT_SECRET=your-secret-key-change-in-production
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://root:rootpassword@localhost:5432/marionette?schema=public
SCENARIO_DATABASE_URL=postgresql://root:rootpassword@localhost:5432/scenariodb?schema=public

# ─── Free LLM Providers ───────────────────────────────────────────────────────

# 1. Gemini Free (recommended primary) — https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_key

# 2. Ollama (local, no key needed) — https://ollama.ai
#    Run: ollama serve && ollama pull llama3.2
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# 3. HuggingFace (free tier) — https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_your_token_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2

# 4. Groq (free tier) — https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_key

# 5. Anthropic (remaining credits only) — https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key

# ─── Optional APIs ────────────────────────────────────────────────────────────
TMDB_API_KEY=your_tmdb_key
KOFIC_API_KEY=your_kofic_key
PINECONE_API_KEY=your_pinecone_key
```

- [ ] **Step 2: Commit**

```bash
cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline
git add .env.example
git commit -m "chore: update .env.example for free-only LLM provider policy

Remove OPENAI_API_KEY and DEEPSEEK_API_KEY.
Add OLLAMA_BASE_URL, OLLAMA_MODEL, HUGGINGFACE_API_KEY, HUGGINGFACE_MODEL.
Document provider priority order."
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered by |
|-----------------|-----------|
| Remove OpenAI from ai-gateway | Task 6 Step 5 (delete) + Step 3/4 (update exports) |
| Remove OpenAI from scenario-core (production_pipeline) | Task 4 Step 1 |
| Remove DeepSeek from scenario-core (production_pipeline) | Task 4 Step 1 |
| Add OllamaProvider to scenario-core | Task 1 |
| Add HuggingFaceProvider to scenario-core | Task 2 |
| Add OllamaProvider to ai-gateway | Task 6 Step 1 |
| Add HuggingFaceProvider to ai-gateway | Task 6 Step 2 |
| Update LLMFactory (production_pipeline) | Task 3 Step 6 |
| Update AnalysisStrategy ProviderChoice | Task 3 Step 4 |
| Update StrategyResolver chain | Task 3 Step 5 |
| Update env.ts | Task 3 Step 3 |
| Mirror all to cine-analysys-system | Task 5 |
| Update .env.example | Task 7 |

All spec requirements covered. ✅

### Placeholder check

No TBDs, TODOs, or incomplete steps. All code blocks are complete. ✅

### Type consistency check

- `ProviderChoice` in `AnalysisStrategy.ts`: `'gemini' | 'gemini-pro' | 'gemini-long' | 'anthropic' | 'ollama' | 'huggingface' | 'groq' | 'mock'`
- `LLMFactory.getProvider(name: ProviderChoice)` — names registered: `gemini`, `gemini-pro`, `gemini-long`, `ollama`, `huggingface`, `groq`, `anthropic`, `mock` — matches type exactly ✅
- `OllamaProvider.name = 'ollama'` — matches `ProviderChoice` ✅
- `HuggingFaceProvider.name = 'huggingface'` — matches `ProviderChoice` ✅
- Both providers implement `ILLMProvider` with `generateText(systemPrompt: string, userPrompt: string)` ✅
