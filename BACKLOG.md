# Marionette Studio — Backlog

> 우선순위 미정 항목. 설계 단계 진입 전 별도 브레인스토밍 필요.

---

## [AUDIO-001] 유튜브 영상 제작용 TTS 파이프라인

**배경**
유튜브 콘텐츠 제작 시 나레이션 음성이 핵심 요소. 현재 `SoundDesigner` 에이전트는
씬별 대사(Dialogue) TTS만 지원하며, 나레이션·다중 화자·자막 동기화는 미구현.

**현재 상태**
- `apps/production-pipeline/src/agents/sound_designer.py` — Gemini TTS로 대사 WAV 생성 ✅
- Studio 대시보드의 `audio_gen` 에이전트가 이를 모니터링 ✅

**추가 필요 기능**
| 기능 | 설명 |
|------|------|
| 나레이션 TTS | 해설·자막용 음성 트랙 (dialogue와 별도) |
| 다중 화자 | 캐릭터별 목소리 구분 (voice_id per character) |
| 음성 미리듣기 | Studio 컷 디테일 패널에서 WAV 재생 |
| 자막 동기화 | TTS 타임코드 → SRT 파일 자동 생성 |

**관련 파일**
- `apps/production-pipeline/src/agents/sound_designer.py`
- `apps/studio/src/lib/studio/types.ts` — `QueueItem`에 `dialogue?`, `speaker?` 필드 추가 검토
- `apps/studio/src/components/studio/AgentDetailPanel.tsx`

---
