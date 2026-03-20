# 버전 관리 시스템

> Date: 2026-03-20 | Status: Approved

## Problem

DirectionPlan/Screenplay 업데이트 시 전체 덮어쓰기. 이력 없음, 롤백 불가.

## Solution

`ProjectSnapshot` 모델로 변경 시 자동 스냅샷 저장. 이력 조회 및 복원 API + UI.

## DB Model

```prisma
model ProjectSnapshot {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  type      String   // "DIRECTION_PLAN" | "SCREENPLAY_OUTLINE" | "SCREENPLAY_DRAFT" | "SCREENPLAY_CHARACTERS"
  version   Int      // auto-increment per project+type
  label     String?  // optional user label ("v1 draft", "after review")
  data      Json     // full snapshot of the data
  createdAt DateTime @default(now())

  @@index([projectId, type])
  @@unique([projectId, type, version])
}
```

## API Endpoints

```
GET  /api/projects/:projectId/snapshots?type=DIRECTION_PLAN  → 이력 목록
GET  /api/projects/:projectId/snapshots/:snapshotId          → 단일 스냅샷 상세
POST /api/projects/:projectId/snapshots/:snapshotId/restore  → 스냅샷 복원
```

### 자동 스냅샷 생성 시점

screenplay.ts에서 DirectionPlan/Screenplay 업데이트 직전에 현재 데이터를 스냅샷 저장:

| 트리거 | type | 저장 데이터 |
|--------|------|------------|
| DirectionPlan 시퀀스 생성 | DIRECTION_PLAN | project.directionPlan |
| DirectionPlan 컷/프롬프트 생성 | DIRECTION_PLAN | project.directionPlan |
| Screenplay outline 생성/수정 | SCREENPLAY_OUTLINE | screenplay.outline |
| Screenplay draft 생성 | SCREENPLAY_DRAFT | screenplay.draft |
| Screenplay characters 생성 | SCREENPLAY_CHARACTERS | screenplay.characters |

### 복원 로직

- DIRECTION_PLAN → `prisma.project.update({ directionPlan: snapshot.data })`
- SCREENPLAY_* → `prisma.screenplay.update({ [field]: snapshot.data })`

## UI

프로젝트 상세 페이지 Development 탭에 "Version History" 섹션:

- 타입별 필터 탭
- 타임라인 리스트: 버전 번호, 생성 시각, 라벨 (있으면)
- "Restore" 버튼 (확인 다이얼로그 후 복원)
- 현재 버전 하이라이트

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/db/prisma/schema.prisma` | MODIFY | ProjectSnapshot 모델 추가 |
| `apps/api/src/routes/snapshots.ts` | CREATE | 스냅샷 CRUD + 복원 API |
| `apps/api/src/index.ts` | MODIFY | snapshotRoutes 등록 |
| `apps/api/src/routes/screenplay.ts` | MODIFY | 업데이트 전 자동 스냅샷 호출 |
| `apps/web/components/version-history.tsx` | CREATE | 버전 이력 UI 컴포넌트 |
| `apps/web/app/(dashboard)/projects/[id]/page.tsx` | MODIFY | VersionHistory 컴포넌트 추가 |

## Error Handling

- 스냅샷 저장 실패 시 원래 업데이트는 계속 진행 (비차단)
- 복원 시 현재 데이터를 먼저 스냅샷 저장 후 복원 (안전망)
- 존재하지 않는 스냅샷 복원 → 404

## Constraints

- 추가 npm 의존성 없음
- 스냅샷 수 제한 없음 (로컬 환경)
- JSON 전체 스냅샷 (diff 아님)
