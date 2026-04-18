# shorts-factory

K-POP 아이돌 팬튜브 숏폼 자동화 플랫폼 (MVP: 에스파).

## 서비스 포트
- Frontend: :5178 (Vite + React)
- Backend: :3008 (Bun + Elysia)
- Python Worker: DB 폴링 (별도 프로세스)

## 런타임
- Bun으로 서버 실행 (`bun --hot server/src/index.ts`)
- Python worker는 `python worker/worker.py`로 별도 실행
- FFmpeg은 시스템에 설치된 것을 subprocess로 호출

## LLM API 비용 정책
- 유료 API 사용 금지 (Anthropic Claude 남은 크레딧 제외)
- Provider fallback: Gemini Free → Groq Free → Anthropic Claude
