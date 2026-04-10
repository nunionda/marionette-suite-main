# GEMINI.md 

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 0. Response Tone & Accuracy (CRITICAL)
- **사실적 전달**: 모든 답변(response)은 사실에 기반하여(fact-based) 객관적으로 전달합니다.
- **과장 금지**: 과장된 표현(exaggerated expressions)은 일절 사용하지 않습니다.
- **구현 결과만 보고**: 구현된 결과만 있는 그대로 보고합니다.
- **추측 금지**: 추측성 발언은 일절 사용하지 않습니다.
- **Phase가 끝나면 다음 우선수위가 높은 Phase 작업을 진행한다.** 

## 1. 전통적 영화 제작 파이프라인에 맞게 구현한다.
- 각 Phase는 독립적으로 동작하며, 이전 Phase의 결과물을 입력으로 받는다.
