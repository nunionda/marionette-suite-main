# Auto-Continuation Policy

## Session Execution Rules
- **NEVER pause mid-task to ask for confirmation** unless a destructive or irreversible action is required.
- When a multi-step task is given, execute ALL steps sequentially without stopping.
- If a sub-task fails, attempt to self-correct and continue. Only stop if the error is unrecoverable.
- Do NOT ask "Should I proceed?" or "Do you want me to continue?" — always proceed unless explicitly told to stop.
- Summarize what was done at the END of the session, not in the middle.

## Autonomous Decision-Making
- Make reasonable assumptions when minor ambiguities arise; document the assumption inline and continue.
- Prefer completing the full task over interrupting for small clarifications.
- If multiple approaches exist, choose the most pragmatic one and proceed.

## Stopping Conditions (ONLY stop for these)
1. A file or data would be permanently deleted with no recovery path.
2. External credentials / API keys are required that were not provided.
3. The task is fundamentally ambiguous at the top level (not sub-task level).

## LLM API 비용 정책 (2026-03-29~)
- **유료 LLM API 사용 금지**: OpenAI 등 유료 API 호출 코드 작성 금지 (단, Anthropic Claude API는 남은 크레딧 범위 내 사용 허용)
- **무료 모델만 사용**: Ollama 로컬 모델, HuggingFace 무료 모델, Google Gemini 무료 티어
- Provider fallback 체인: Gemini Free → Ollama → HuggingFace → Groq Free → Anthropic Claude (남은 크레딧 허용)
