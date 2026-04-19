export type PictureLockStatus =
  | "draft"
  | "editor-cut"
  | "director-cut"
  | "producer-cut"
  | "locked";

export interface PictureLockVersion {
  id: string;
  projectId: string;
  version: string;
  date: string;
  totalRuntime: string;
  scenes: number;
  cuts: number;
  status: PictureLockStatus;
  lockedAt?: string;
  notes?: string;
}

export const STATUS_COLOR: Record<PictureLockStatus, string> = {
  draft:          "#707070",
  "editor-cut":   "#60a5fa",
  "director-cut": "#a78bfa",
  "producer-cut": "#f59e0b",
  locked:         "#00FF41",
};

export const STATUS_LABEL: Record<PictureLockStatus, string> = {
  draft:          "드래프트",
  "editor-cut":   "편집본",
  "director-cut": "감독본",
  "producer-cut": "제작본",
  locked:         "픽처 락",
};

export const MOCK_VERSIONS: PictureLockVersion[] = [
  {
    id: "pl-001",
    projectId: "BEAT-SAVIOR",
    version: "v0.1",
    date: "2026-04-10",
    totalRuntime: "01:52:14",
    scenes: 87,
    cuts: 1204,
    status: "editor-cut",
    notes: "러프 어셈블리 — 씬 정렬 완료, 템포 조정 전",
  },
  {
    id: "pl-002",
    projectId: "BEAT-SAVIOR",
    version: "v0.5",
    date: "2026-04-15",
    totalRuntime: "01:48:30",
    scenes: 84,
    cuts: 1189,
    status: "director-cut",
    notes: "감독 검토 — 씬 3개 재편집, 오프닝 재구성",
  },
  {
    id: "pl-003",
    projectId: "BEAT-SAVIOR",
    version: "v1.0",
    date: "2026-04-20",
    totalRuntime: "01:45:52",
    scenes: 82,
    cuts: 1163,
    status: "producer-cut",
    notes: "제작사 검토 — 2막 페이스 이슈, 재편집 요청",
  },
  {
    id: "pl-004",
    projectId: "PROJECT-NOVA",
    version: "v0.1",
    date: "2026-05-01",
    totalRuntime: "01:38:00",
    scenes: 71,
    cuts: 998,
    status: "draft",
    notes: "초안 어셈블리 진행 중",
  },
];
