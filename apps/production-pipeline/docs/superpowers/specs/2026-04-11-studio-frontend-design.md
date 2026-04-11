# Studio 통합 프론트엔드 설계

**날짜:** 2026-04-11  
**범위:** marionette-suite 통합 스튜디오 프론트엔드 (`apps/studio`)  
**목표:** script-writer + production-pipeline/web + scenario-web 3개 앱을 단일 앱으로 통합

---

## 1. 배경 및 목적

### 현재 문제
| 앱 | 위치 | 역할 | 문제 |
|----|------|------|------|
| `script-writer` | `apps/script-writer` | 씨네 스크립라이터 (Vite) | 독립 앱, 통합 안됨 |
| `production-pipeline/web` | `apps/production-pipeline/apps/web` | 파이프라인/씬/에이전트 관리 | 분석 없음 |
| `scenario-web` | `apps/production-pipeline/apps/scenario-web` | 시나리오 분석 대시보드 | 파이프라인 없음 |

### 해결 방향
새 앱 `apps/studio`를 Netflix Studio + Runway ML UX 참고하여 신규 개발.  
기존 앱의 **백엔드(API)는 그대로 유지**, 프론트엔드만 통합.

---

## 2. 데이터 규모

```
영화 1편 = 120~150씬 × 20컷 = 2,400~3,000컷
각 컷 = 3~5초 영상 1개 + 이미지 1~4장 + 프롬프트들
```

**핵심 설계 원칙: 계층별 독립 로딩**  
- 씬 목록: 150개 씬 메타데이터만 (대표이미지 URL, 진행률)
- 씬 상세: 해당 씬의 20컷만
- 컷 에디터: 해당 컷 1개 + 에셋
- DOM 가상화 필수 (react-virtual)

---

## 3. 데이터 모델

```typescript
Project {
  id, title, status, posterUrl
  sequences: Sequence[]
}

Sequence {
  id, number, title, projectId
  sceneCount, completedSceneCount
}

Scene {
  id, number, sequenceId
  title, location, timeOfDay, summary
  representativeImageUrl          // 씬 목록 썸네일
  cutCount, completedCutCount
  status: 'pending' | 'in_progress' | 'done'
  cuts: Cut[]                     // 씬 상세 진입 시에만 로드
}

Cut {
  id, number, sceneId
  duration: 3 | 4 | 5            // 초 단위
  imagePrompt, videoPrompt
  status: 'pending' | 'generating' | 'done' | 'approved'
  assets: Asset[]
}

Asset {
  id, cutId, type: 'image' | 'video' | 'audio'
  url, provider, approved: boolean
}

Agent {
  id, type, projectId
  status: 'idle' | 'running' | 'done' | 'error'
  currentTask?: { sceneId, cutId }
  stats: { processed, errors, queueSize }
}
```

---

## 4. URL 구조

```
/                                                   홈 · 프로젝트 목록
/studio/[projectId]                                 씨네 스크립라이터 (1단계)

/projects/[id]                                      프로젝트 허브
  ?tab=overview|analysis|agents|management

/projects/[id]/scenes                               씬 목록 (2,3단계 진입점)
  ?seq=[sequenceId]                                 시퀀스 필터
  ?status=pending|in_progress|done                  상태 필터

/projects/[id]/scenes/[sceneId]                     씬 상세 · 컷 필름스트립
/projects/[id]/scenes/[sceneId]/cuts/[cutId]        컷 노드 에디터

/projects/[id]/agents                               에이전트 허브
/projects/[id]/agents/[agentId]                     에이전트 상세
```

---

## 5. 페이지별 설계

### 5-1. 홈 `/`
- **역할:** 제작 중인 영화 프로젝트 목록
- **UX:** Netflix 그리드. 카드 = 포스터 + 제목 + 전체진행률(`컷완료/전체컷`) + 현재 단계 뱃지
- **성능:** 이미지 lazy load, skeleton UI

### 5-2. 씨네 스크립라이터 `/studio/[id]`
- **역할:** 시나리오 집필, AI 보조 작성 (1단계)
- **UX:** 기존 script-writer 앱 기능 이전
- **통합:** `scenario-api`와 연결해 분석 즉시 요청 가능

### 5-3. 프로젝트 허브 `/projects/[id]`
4개 탭 구조:
- **[개요]** — 시퀀스 카드 그리드 (시퀀스명 + 씬수 + 진행률 바)
- **[시나리오분석]** — scenario-web 흡수 (EmotionChart, CharacterIntelligence, BeatSheet 등)
- **[에이전트현황]** — 실행중 에이전트 요약 테이블
- **[관리]** — 승인된 컷 수, 내보내기 버튼

### 5-4. 씬 목록 `/projects/[id]/scenes`
- **역할:** 120~150씬 전체 현황 파악 + 제작 진입
- **레이아웃:** 
  - 상단: 시퀀스 탭 필터 + 상태 필터
  - 본문: 4열 그리드, 씬 카드 (대표이미지, 씬번호, `완료컷/전체컷`, 상태 뱃지)
- **성능:** react-virtual 가상 스크롤 (150개 DOM 동시 렌더 금지)
- **인터랙션:** 카드 클릭 → 씬 상세

### 5-5. 씬 상세 `/projects/[id]/scenes/[sceneId]`
- **역할:** 씬 정보 + 20컷 필름스트립
- **레이아웃:**
  - 상단 헤더: 씬 정보 (시퀀스, 장소, 시간대, 등장인물, 길이)
  - 본문: 가로 스크롤 필름스트립 (컷 카드 20개)
  - 컷 카드: 이미지/상태/duration 표시, 클릭 → 컷 노드 에디터
- **이동:** 이전씬 ← → 다음씬 네비게이션

### 5-6. 컷 노드 에디터 `/projects/[id]/scenes/[sceneId]/cuts/[cutId]` ⭐
- **역할:** AI 영상 제작 프로세스를 노드로 표현
- **기술:** React Flow (또는 @xyflow/react)
- **노드 타입:**
  ```
  ScriptNode      스크립트 원문 (읽기전용)
      ↓
  ImagePromptNode 이미지 프롬프트 편집
      ↓
  ImageGenNode    이미지 생성 (Midjourney/DALL-E/Stable Diffusion)
      ↓
  ImagePickNode   생성된 이미지 중 선택 (최대 4장)
      ↓
  VideoPromptNode 영상 프롬프트 + 카메라무브 지정
      ↓
  VideoGenNode    영상 생성 (Runway/Kling/Higgsfield)
      ↓
  AudioNode       대사 TTS 또는 나레이션
      ↓
  FinalCutNode    최종 컷 승인 [✓ 승인]
  ```
- **우측 패널:** 선택된 노드의 결과물 미리보기 (이미지/영상 플레이어)
- **하단 바:** 이전컷 ← → 다음컷 (씬 내 이동, 단축키 지원)
- **저장:** 노드 레이아웃 + 연결 상태 자동 저장 (per 컷)

### 5-7. 에이전트 허브 `/projects/[id]/agents`
- **역할:** 실행 중인 AI 에이전트 전체 현황 모니터링
- **레이아웃:** 에이전트 유형별 행 (이미지생성/영상생성/음성합성/프롬프트/분석)
  - 컬럼: 유형, 현재 작업, 처리량, 에러수, 큐 대기
- **실시간:** WebSocket으로 상태 업데이트
- **인터랙션:** 행 클릭 → 에이전트 상세

### 5-8. 에이전트 상세 `/projects/[id]/agents/[agentId]`
- **역할:** 특정 에이전트 설정, 실시간 로그, 처리한 컷 갤러리
- **레이아웃:** 2컬럼
  - 좌측: 에이전트 설정 (모델, 동시처리수, 큐) + 컷 갤러리
  - 우측: 실시간 로그 스트림

### 5-9. 관리 페이지 `/projects/[id]` → [관리] 탭
- **역할:** 승인된 컷들을 시퀀스→씬 순서로 조합, 최종 미리보기 및 내보내기
- **레이아웃:**
  - 시퀀스별 아코디언
  - 씬별 승인 컷 썸네일 스트립 + 씬 미리보기 버튼
- **액션:** [전체 미리보기] [MP4 내보내기]

---

## 6. 기술 스택

```
Framework:      Next.js 15 (App Router)
Language:       TypeScript strict
Styling:        Tailwind CSS + CSS Variables (다크 테마 우선)
노드 에디터:    @xyflow/react (React Flow v12)
가상 스크롤:    @tanstack/react-virtual
실시간:         WebSocket (기존 scenario-api ws 활용)
상태관리:       Zustand (전역) + React Query (서버 상태)
아이콘:         lucide-react
애니메이션:     Framer Motion (페이지 전환, 카드 hover)
```

---

## 7. 디자인 시스템

```css
/* 컬러 팔레트 — 시네마틱 다크 */
--bg-base:      #0a0a0f;   /* 거의 검정 */
--bg-surface:   #111118;   /* 카드 배경 */
--bg-elevated:  #1a1a24;   /* 모달/패널 */
--border:       #2a2a3a;
--text-primary: #f0f0f8;
--text-dim:     #8888aa;
--accent:       #6366f1;   /* 인디고 — 액션/선택 */
--success:      #22c55e;
--warning:      #f59e0b;
--danger:       #ef4444;
```

---

## 8. 구현 우선순위

| 단계 | 범위 | 목표 |
|------|------|------|
| **Phase 1** | 앱 셋업 + 홈 + 프로젝트 허브 | 기본 내비게이션 동작 |
| **Phase 2** | 씬 목록 + 씬 상세 | 150씬 탐색 가능 |
| **Phase 3** | 컷 노드 에디터 | 핵심 제작 기능 |
| **Phase 4** | 에이전트 허브/상세 | 실시간 모니터링 |
| **Phase 5** | 씨네 스크립라이터 통합 | 기존 앱 이전 |
| **Phase 6** | 시나리오 분석 통합 | scenario-web 흡수 |

---

## 9. 기존 백엔드 API 활용

```
scenario-api  :4005  → 시나리오 분석 (그대로 사용)
production api :4000  → 파이프라인/에이전트/씬 (그대로 사용)
```

신규 studio 앱은 API를 소비하기만 하며, 백엔드 변경 최소화.
