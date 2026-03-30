# Ollama Local Setup

## Status: Not Installed

Ollama is not currently installed on this machine (verified 2026-03-30).

## Installation Instructions

### macOS (recommended)

```bash
# Option 1: Direct download
# Download from https://ollama.com/download/mac

# Option 2: Homebrew
brew install ollama
```

### Post-install

```bash
# Start the Ollama service
ollama serve

# Pull recommended models for the project (free, local)
ollama pull gemma3:4b          # Fast, lightweight (Google)
ollama pull llama3.2:3b        # Meta's small model
ollama pull qwen2.5:7b         # Alibaba, good for code

# Verify
ollama list
```

### Verify health

```bash
ollama --version
curl http://localhost:11434/api/tags   # List loaded models via API
```

## Integration with Production Pipeline

The pipeline's provider fallback chain is:

```
Gemini Free → Groq Free → Anthropic Claude (credit) → Mock
```

Once Ollama is installed, the Backend Developer should add an Ollama provider to the chain:

```
Gemini Free → Ollama (local) → Groq Free → Anthropic Claude (credit) → Mock
```

Ollama runs entirely local — no API costs, no rate limits.

## Recommended Models for Scenario Analysis

| Model | Size | Use Case |
|-------|------|----------|
| gemma3:4b | ~2.7GB | Fast analysis, beat sheets |
| llama3.2:3b | ~2GB | Quick summarization |
| qwen2.5:7b | ~4.4GB | Code generation, structured output |
| deepseek-r1:7b | ~4.4GB | Reasoning-heavy tasks |

## Notes

- All models are free and run locally
- Requires ~8GB RAM minimum for 7B models
- GPU acceleration available on Apple Silicon (Metal)
