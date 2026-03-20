# 씬별 교차 에셋 생성 (Interleaved Scene Asset Generation)

> Date: 2026-03-21 | Status: Approved

## Problem

현재 파이프라인은 전체 씬의 연출기획(Direction Plan)이 완성된 후, Pre-Production 탭에서 전체 스토리보드를 일괄 생성하고, Production 탭에서 전체 비디오를 일괄 생성하는 순차 구조. 씬 하나의 프롬프트가 완성되어도 이미지/비디오 생성을 시작할 수 없어 대기 시간이 발생.

## Solution

Screenplay 페이지 Step 6(연출기획)에 "에셋 생성" 서브탭을 추가하여, 씬별로 프롬프트 완성 즉시 이미지→비디오→오디오를 교차 생성할 수 있게 한다. 프론트엔드 UI 변경 + 백엔드 씬 단위 생성 API 2개 추가.

## Architecture

### 씬별 상태 흐름

```
프롬프트 미완성 → 프롬프트 완료 → 🖼 이미지 생성 가능
                                      ↓ (생성 완료)
                                 🎬 비디오 생성 가능
                                      ↓ (생성 완료)
                                 🔊 오디오 생성 가능
                                      ↓ (생성 완료)
                                 ✅ 전체 완료
```

활성화 조건:
- 이미지 버튼: 해당 씬의 모든 컷에 `image_prompt`가 존재
- 비디오 버튼: 해당 씬의 이미지 Asset이 DB에 존재
- 오디오 버튼: 해당 씬의 비디오 Asset이 DB에 존재

### 프론트엔드 — 에셋 생성 서브탭

**위치**: `apps/web/app/(dashboard)/projects/[id]/screenplay/page.tsx`
**Step 6 서브탭**: 기존 [씬 분석 | 컷 설계 | 프롬프트] → [씬 분석 | 컷 설계 | 프롬프트 | **에셋 생성**]

에셋 생성 탭 레이아웃:
- 씬 카드 목록 (시퀀스별 그룹핑)
- 카드마다:
  - 씬 번호 + 시퀀스 + 컷 수
  - 3단계 진행 표시: 이미지 | 비디오 | 오디오
  - 각 단계별: "생성" / "재생성" / 스피너(진행 중) 버튼
  - 완료 시 썸네일 미리보기

### 백엔드 API

#### 이미지 생성 (기존 API 활용)

```
POST /api/screenplay/:projectId/direction-plan/storyboard/generate
Body: { scope: "scene", sceneNumber: N, style?: "webtoon" }
```
- ConceptArtist 에이전트가 해당 씬의 `image_prompt`로 이미지 생성
- Asset(type: IMAGE, sceneNumber: N) DB 저장

#### 비디오 생성 (새 API)

```
POST /api/screenplay/:projectId/scene/:sceneNumber/generate-video
```
- 해당 씬의 모든 컷에 대해 Generalist 에이전트 호출
- 각 컷의 `video_prompt`로 비디오 생성 (Veo 3.0)
- 컷별 진행 상태 WebSocket 전송
- Asset(type: VIDEO, sceneNumber: N) DB 저장

#### 오디오 생성 (새 API)

```
POST /api/screenplay/:projectId/scene/:sceneNumber/generate-audio
```
- 해당 씬의 dialogue를 SoundDesigner 에이전트로 TTS 생성
- Asset(type: AUDIO, sceneNumber: N) DB 저장

#### 에셋 상태 조회 (기존 API 활용)

```
GET /api/assets/:projectId?sceneNumber=N&type=IMAGE
GET /api/assets/:projectId?sceneNumber=N&type=VIDEO
GET /api/assets/:projectId?sceneNumber=N&type=AUDIO
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/routes/screenplay.ts` | MODIFY | generate-video, generate-audio 엔드포인트 추가 |
| `apps/web/app/(dashboard)/projects/[id]/screenplay/page.tsx` | MODIFY | "에셋 생성" 서브탭 + 씬별 카드 UI |

## Constraints

- 기존 API 최대한 재사용 (이미지 생성, 에셋 조회)
- 기존 Pre-Production / Production 탭 기능 유지 (일괄 생성 경로 보존)
- 추가 npm 의존성 없음
- WebSocket 이벤트는 기존 PipelineEventBus 활용
