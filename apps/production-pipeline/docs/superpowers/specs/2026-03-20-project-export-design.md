# 프로젝트 내보내기 (ZIP 스트리밍)

> Date: 2026-03-20 | Status: Approved

## Problem

프로젝트 에셋 다운로드가 단일 파일(`GET /download/:assetId`)만 가능. 최종 산출물(영상, 오디오, 이미지, 시나리오)을 일괄 다운로드할 방법이 없음.

## Solution

`fflate` 라이브러리로 프로젝트 에셋을 ZIP으로 묶어 HTTP 응답으로 전송. 웹 UI에 Export 버튼 추가.

## API

```
GET /api/export/:projectId              → 전체 에셋 ZIP
GET /api/export/:projectId?type=VIDEO   → 타입별 필터
GET /api/export/:projectId?type=AUDIO,IMAGE → 복수 타입 (쉼표 구분)
```

### 응답 헤더
```
Content-Type: application/zip
Content-Disposition: attachment; filename="project-title.zip"
```

### ZIP 내부 구조
```
my-project.zip
├── project.json          (제목, 장르, 로그라인, 에셋 목록)
├── IMAGE/
│   ├── scene_001_concept_artist.png
│   └── scene_002_concept_artist.png
├── VIDEO/
│   └── scene_001_generalist.mp4
├── AUDIO/
│   ├── scene_001_dialogue.wav
│   └── scene_001_bgm.mp3
└── DOCUMENT/
    └── direction_plan.json
```

### project.json 포함 내용
```json
{
  "title": "프로젝트명",
  "genre": "SF",
  "logline": "...",
  "exportedAt": "2026-03-20T12:00:00Z",
  "assets": [
    { "type": "VIDEO", "fileName": "scene_001_generalist.mp4", "agent": "generalist", "scene": 1 }
  ]
}
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/api/package.json` | MODIFY | `fflate` 의존성 추가 |
| `apps/api/src/routes/export.ts` | CREATE | ZIP 생성 + 스트리밍 응답 |
| `apps/api/src/index.ts` | MODIFY | exportRoutes 라우트 등록 |
| `apps/web/app/(dashboard)/projects/[id]/page.tsx` | MODIFY | Export 버튼 추가 |

## Error Handling

- 프로젝트 없음 → 404
- 에셋 없음 → 200 + 빈 ZIP (project.json만 포함)
- 파일 읽기 실패 → 해당 파일 스킵, 계속 진행

## Constraints

- `fflate` 사용 (경량 순수 JS ZIP, Bun 호환)
- 로컬 맥북 환경
- 기존 단일 파일 다운로드 엔드포인트 유지
