# cine-script-writer

## LLM API 비용 정책 (2026-03-29~)
- **유료 LLM API 사용 금지**: OpenAI 등 유료 API 호출 코드 작성 금지 (단, Anthropic Claude API는 남은 크레딧 범위 내 사용 허용)
- **무료 모델만 사용**: Ollama 로컬 모델, HuggingFace 무료 모델, Google Gemini 무료 티어
- Provider fallback 체인: Gemini Free → Ollama → HuggingFace → Groq Free → Anthropic Claude (남은 크레딧 허용)
