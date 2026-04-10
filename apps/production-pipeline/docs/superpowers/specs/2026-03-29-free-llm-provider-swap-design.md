# Free LLM Provider Swap — Design Spec

> Date: 2026-03-29 | Status: Approved

## Problem

The codebase references paid LLM APIs (OpenAI, DeepSeek) in violation of the 2026-03-29 cost policy. These must be removed and replaced with free-tier providers.

## Scope

Two repos share near-identical LLM infrastructure and both require changes:

1. `production_pipeline/packages/ai-gateway/` — gateway-layer providers
2. `production_pipeline/packages/scenario-core/src/creative/infrastructure/llm/` — analysis engine providers
3. `cine-analysys-system/packages/core/src/creative/infrastructure/llm/` — mirror of scenario-core

## Approved Approach: Option A — Surgical Removal + Direct Replacement

### Provider Chain (new)

```
Gemini Free → Ollama (local) → HuggingFace (free Inference API) → Groq Free → Anthropic (credits) → Mock
```

### Changes per repo

#### `ai-gateway` package
- **Delete**: `providers/openai.ts`
- **Add**: `providers/ollama.ts` — wraps Ollama REST API (`localhost:11434/v1/chat/completions`, OpenAI-compatible)
- **Add**: `providers/huggingface.ts` — wraps HuggingFace free Inference API (`api-inference.huggingface.co`)
- **Update**: `providers/index.ts` — remove OpenAI export, add Ollama + HuggingFace exports

#### `scenario-core` LLM layer (production_pipeline)
- **Delete**: `OpenAIProvider.ts`, `DeepSeekProvider.ts`
- **Add**: `OllamaProvider.ts`, `HuggingFaceProvider.ts`
- **Update**: `LLMFactory.ts` — remove openai/deepseek registrations, add ollama/huggingface
- **Update**: `AnalysisStrategy.ts` — remove `'openai'` and `'deepseek'` from `ProviderChoice` type
- **Update**: `StrategyResolver.ts` — new default chain: gemini → ollama → huggingface → groq → anthropic → mock

#### `cine-analysys-system` (mirror, same changes)
- Same file set under `packages/core/src/creative/infrastructure/llm/`

#### `.env.example` (production_pipeline)
- Remove `OPENAI_API_KEY`
- Add `OLLAMA_BASE_URL=http://localhost:11434`, `HUGGINGFACE_API_KEY=hf_...`
- Update priority comment

## Provider Implementation Notes

**OllamaProvider**: Calls `POST /v1/chat/completions` on the local Ollama server (default `http://localhost:11434`). Model defaults to `llama3.2` (configurable via `OLLAMA_MODEL` env var). No API key needed. Text-only capability.

**HuggingFaceProvider**: Calls `POST https://api-inference.huggingface.co/models/{model}` with `Authorization: Bearer {HF_TOKEN}`. Free tier. Default model `mistralai/Mistral-7B-Instruct-v0.2`. Text-only capability.

## What Changes in Strategy Behavior

| Strategy | Before | After |
|----------|--------|-------|
| `fast` | gemini | gemini (unchanged) |
| `budget` | groq + deepseek | groq + ollama (local) |
| `deep` | anthropic + gemini | anthropic + gemini (unchanged) |
| `premium` | anthropic + gemini | anthropic + gemini (unchanged) |
| `long-context` | gemini-long + deepseek | gemini-long + ollama |
| `auto` default | gemini-pro → groq → deepseek → anthropic → openai | gemini → ollama → huggingface → groq → anthropic |

## Out of Scope

- Suno, Replicate, MusicGen providers (non-text, not paid-text APIs)
- Python agents in `production_pipeline/src/` (already use Gemini only)
- Adding Ollama/HuggingFace to the `ai-gateway` video/image capability (no free alternatives exist)
