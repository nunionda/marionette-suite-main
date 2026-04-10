# 에셋 갤러리 고도화

> Date: 2026-03-20 | Status: Approved

## Problem

에셋 갤러리가 기본 그리드 + 타입 필터만 제공. 에셋을 자세히 보거나 개별 다운로드할 방법이 없고, 씬별 구분 없이 flat grid로 표시.

## Solution

라이트박스 모달 + 개별 다운로드 버튼 + 씬 번호별 그룹핑 추가.

## Components

### 1. AssetLightbox 모달

카드 클릭 시 전체화면 오버레이 (`bg-black/90`):

- **이미지**: 원본 크기, `object-contain`
- **비디오**: 큰 플레이어 (`controls`, `autoPlay`)
- **오디오**: 웨이브폼 플레이스홀더 + 큰 오디오 플레이어
- **기타 타입**: 파일 아이콘 + 메타데이터 표시

#### 헤더
- 파일명, 타입 뱃지, 씬 번호, 에이전트명, 파일 크기
- 다운로드 버튼 (우측)
- 닫기 버튼 (우측 상단)

#### 네비게이션
- 좌/우 화살표 버튼으로 이전/다음 에셋 (현재 필터된 목록 기준)
- 키보드: `Escape` 닫기, `ArrowLeft`/`ArrowRight` 네비게이션

#### Props
```typescript
interface AssetLightboxProps {
  assets: Asset[]          // 현재 필터된 에셋 목록
  currentIndex: number     // 선택된 에셋 인덱스
  onClose: () => void
  onNavigate: (index: number) => void
}
```

### 2. AssetCard 다운로드 버튼

각 카드에 호버 시 우측 상단 다운로드 아이콘 오버레이:
- `<a>` 태그, `href` = `/api/assets/download/${asset.id}`, `download` 속성
- `e.stopPropagation()`으로 라이트박스 열림 방지
- 반투명 배경 원형 버튼

### 3. 씬 그룹핑

- **all 필터**: 씬 번호별 섹션 분리 (`Scene 1`, `Scene 2`, ..., `Other`)
- **타입 필터**: 기존 flat grid 유지
- 씬 번호 오름차순, `null`은 마지막 "Other" 섹션
- 각 섹션: 제목 + 그리드

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/web/components/asset-lightbox.tsx` | CREATE | 라이트박스 모달 컴포넌트 |
| `apps/web/components/asset-gallery.tsx` | MODIFY | 카드 클릭→라이트박스, 다운로드 버튼, 씬 그룹핑 |

## Error Handling

- 이미지/비디오 로드 실패 → 폴백 아이콘 표시
- API 변경 없음 (기존 `GET /api/assets/download/:id` 그대로 사용)

## Constraints

- 추가 npm 의존성 없음
- 기존 글라스모피즘 디자인 시스템 유지
- 기존 API 엔드포인트 변경 없음
