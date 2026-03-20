# 에셋 갤러리 고도화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 에셋 갤러리에 라이트박스 모달, 개별 다운로드 버튼, 씬 그룹핑 추가

**Architecture:** 새 `AssetLightbox` 컴포넌트 생성 + 기존 `AssetGallery` 수정. API 변경 없음.

**Tech Stack:** React, TypeScript, Next.js 15, Tailwind CSS

---

### Task 1: AssetLightbox 컴포넌트 생성

**Files:**
- Create: `apps/web/components/asset-lightbox.tsx`

**Spec:** `docs/superpowers/specs/2026-03-20-asset-gallery-design.md` — "AssetLightbox 모달" 섹션

**Context:**
- 기존 `Asset` 인터페이스는 `apps/web/components/asset-gallery.tsx:6-17`에 정의
- API 에셋 다운로드: `${API_BASE}/api/assets/download/${asset.id}`
- `API_BASE`는 `apps/web/lib/api.ts`에서 export
- 기존 디자인: 다크 테마 (`bg-gray-900`, `border-gray-800`, `text-gray-300`)
- 타입 뱃지 색상: `TYPE_BADGE_COLORS` — `asset-gallery.tsx:33-39`

**Implementation details:**

- [ ] **Step 1: AssetLightbox 컴포넌트 작성**

```typescript
// apps/web/components/asset-lightbox.tsx
"use client"

import { useEffect, useCallback } from "react"
import { API_BASE } from "../lib/api"

interface Asset {
  id: string
  type: string
  phase: string
  agent_name: string
  scene_number: number | null
  file_path: string
  file_name: string
  mime_type: string
  file_size: number | null
  created_at: string
}

interface AssetLightboxProps {
  assets: Asset[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}
```

구현 요구사항:
- `bg-black/90` 오버레이, `fixed inset-0 z-50`
- 오버레이 클릭 시 닫기 (내부 콘텐츠 클릭은 `stopPropagation`)
- 헤더: 파일명, 타입 뱃지, 씬/에이전트 정보, 파일 크기, 다운로드 `<a>` 버튼, 닫기 버튼
- 미디어 영역: 이미지(`object-contain max-h-[70vh]`), 비디오(`controls autoPlay max-h-[70vh]`), 오디오(웨이브폼 + 플레이어), 기타(파일 아이콘)
- 좌/우 화살표: `absolute` 포지션, 첫/마지막에서 비활성
- `useEffect`로 키보드 이벤트: `Escape` → onClose, `ArrowLeft` → prev, `ArrowRight` → next
- `formatFileSize` 헬퍼 (asset-gallery.tsx와 동일)

- [ ] **Step 2: typecheck 확인**

Run: `cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline && bun run typecheck`

- [ ] **Step 3: 커밋**

```bash
git add apps/web/components/asset-lightbox.tsx
git commit -m "feat: add AssetLightbox component for fullscreen asset viewer"
```

---

### Task 2: AssetCard 다운로드 버튼 + 라이트박스 연동

**Files:**
- Modify: `apps/web/components/asset-gallery.tsx`

**Spec:** `docs/superpowers/specs/2026-03-20-asset-gallery-design.md` — "AssetCard 다운로드 버튼" 섹션

**Context:**
- `AssetCard` 컴포넌트: `asset-gallery.tsx:67-158`
- `AssetGallery` 컴포넌트: `asset-gallery.tsx:161-247`
- 새로 만든 `AssetLightbox`: `asset-lightbox.tsx`

**Implementation details:**

- [ ] **Step 1: AssetCard에 onClick prop 추가 + 다운로드 버튼 오버레이**

AssetCard 변경사항:
- props에 `onClick?: () => void` 추가
- 카드 외부 div에 `onClick` + `cursor-pointer`
- 미디어 영역에 호버 시 다운로드 버튼 오버레이:
  ```
  <a> 태그, absolute top-2 right-2
  href={`${API_BASE}/api/assets/download/${asset.id}`}
  download attribute
  e.stopPropagation() (라이트박스 열림 방지)
  rounded-full bg-black/60 hover:bg-black/80 p-2
  다운로드 SVG 아이콘
  opacity-0 group-hover:opacity-100 transition-opacity
  ```
- 미디어 영역 div에 `group` 클래스 추가

- [ ] **Step 2: AssetGallery에 라이트박스 상태 추가**

```typescript
const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
```

- `AssetCard`에 `onClick={() => setLightboxIndex(indexInFilteredList)}` 전달
- 조건부 `<AssetLightbox>` 렌더링:
  ```typescript
  {lightboxIndex !== null && (
    <AssetLightbox
      assets={filteredAssets}
      currentIndex={lightboxIndex}
      onClose={() => setLightboxIndex(null)}
      onNavigate={setLightboxIndex}
    />
  )}
  ```

- [ ] **Step 3: typecheck 확인**

Run: `cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline && bun run typecheck`

- [ ] **Step 4: 커밋**

```bash
git add apps/web/components/asset-gallery.tsx
git commit -m "feat: add download button and lightbox integration to AssetCard"
```

---

### Task 3: 씬 번호별 그룹핑

**Files:**
- Modify: `apps/web/components/asset-gallery.tsx`

**Spec:** `docs/superpowers/specs/2026-03-20-asset-gallery-design.md` — "씬 그룹핑" 섹션

**Context:**
- `AssetGallery` 렌더링: `asset-gallery.tsx` 하단의 grid 렌더링 부분
- `filteredAssets` 배열, `activeFilter` 상태
- `Asset` 인터페이스의 `scene_number: number | null`

**Implementation details:**

- [ ] **Step 1: 그룹핑 로직 + 렌더링 수정**

all 필터일 때만 씬 그룹핑:

```typescript
function groupByScene(assets: Asset[]): Map<number | null, Asset[]> {
  const groups = new Map<number | null, Asset[]>()
  for (const asset of assets) {
    const key = asset.scene_number
    const list = groups.get(key) ?? []
    list.push(asset)
    groups.set(key, list)
  }
  return groups
}
```

렌더링:
- `activeFilter === "all"`: 씬별 섹션 (숫자 오름차순, null 마지막)
  - 각 섹션: `<h3>Scene {n}</h3>` (또는 "Other") + 그리드
  - 라이트박스 인덱스 계산 시 전체 filteredAssets 기준 offset 필요
- 타입 필터: 기존 flat grid 유지

**주의사항:**
- 라이트박스의 `assets` prop은 여전히 `filteredAssets` (전체 flat 배열)
- 카드 클릭 시 `filteredAssets.indexOf(asset)`로 라이트박스 인덱스 계산
- `lightboxIndex` 상태는 filteredAssets 배열 기준

- [ ] **Step 2: typecheck 확인**

Run: `cd /Users/daniel/dev/claude-dev/marionette-dev/production_pipeline && bun run typecheck`

- [ ] **Step 3: 커밋**

```bash
git add apps/web/components/asset-gallery.tsx
git commit -m "feat: add scene-based grouping to asset gallery"
```
