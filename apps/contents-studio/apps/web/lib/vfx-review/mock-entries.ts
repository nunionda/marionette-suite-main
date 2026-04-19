export type VfxComplexity = "simple" | "medium" | "complex" | "hero";
export type VfxReviewStatus =
  | "pending"
  | "in-progress"
  | "internal-review"
  | "vendor-review"
  | "approved"
  | "locked";

export interface VfxReviewShot {
  id: string;
  projectId: string;
  shotCode: string;
  sequence: string;
  description: string;
  vendor: string;
  complexity: VfxComplexity;
  versions: number;
  status: VfxReviewStatus;
  notes?: string;
}

export const COMPLEXITY_COLOR: Record<VfxComplexity, string> = {
  simple:  "#707070",
  medium:  "#60a5fa",
  complex: "#f59e0b",
  hero:    "#ef4444",
};

export const COMPLEXITY_LABEL: Record<VfxComplexity, string> = {
  simple:  "단순",
  medium:  "중간",
  complex: "복잡",
  hero:    "히어로",
};

export const STATUS_COLOR: Record<VfxReviewStatus, string> = {
  pending:         "#707070",
  "in-progress":   "#60a5fa",
  "internal-review": "#a78bfa",
  "vendor-review": "#f59e0b",
  approved:        "#00FF41",
  locked:          "#22c55e",
};

export const STATUS_LABEL: Record<VfxReviewStatus, string> = {
  pending:           "대기",
  "in-progress":     "작업중",
  "internal-review": "내부검토",
  "vendor-review":   "외부검토",
  approved:          "승인",
  locked:            "확정",
};

export const MOCK_SHOTS: VfxReviewShot[] = [
  {
    id: "vr-001",
    projectId: "BEAT-SAVIOR",
    shotCode: "BS_VFX_001",
    sequence: "SEQ_03",
    description: "오프닝 드론 합성 — 서울 야경 컴포지팅",
    vendor: "StormVFX",
    complexity: "hero",
    versions: 4,
    status: "approved",
  },
  {
    id: "vr-002",
    projectId: "BEAT-SAVIOR",
    shotCode: "BS_VFX_002",
    sequence: "SEQ_07",
    description: "한강 리플렉션 CG 물 시뮬레이션",
    vendor: "StormVFX",
    complexity: "complex",
    versions: 3,
    status: "vendor-review",
    notes: "리플렉션 각도 수정 요청 — v3 제출 대기",
  },
  {
    id: "vr-003",
    projectId: "BEAT-SAVIOR",
    shotCode: "BS_VFX_003",
    sequence: "SEQ_12",
    description: "병원 창문 디지털 매트 페인팅",
    vendor: "PixelForge",
    complexity: "medium",
    versions: 2,
    status: "internal-review",
  },
  {
    id: "vr-004",
    projectId: "BEAT-SAVIOR",
    shotCode: "BS_VFX_004",
    sequence: "SEQ_22",
    description: "재촬영분 배경 교체 — 병원 복도",
    vendor: "PixelForge",
    complexity: "simple",
    versions: 1,
    status: "in-progress",
  },
  {
    id: "vr-005",
    projectId: "PROJECT-NOVA",
    shotCode: "PN_VFX_001",
    sequence: "SEQ_01",
    description: "항구 크레인 CG 확장 — 인천항",
    vendor: "HorizonFX",
    complexity: "complex",
    versions: 2,
    status: "in-progress",
  },
  {
    id: "vr-006",
    projectId: "PROJECT-NOVA",
    shotCode: "PN_VFX_002",
    sequence: "SEQ_02",
    description: "선박 엔진룸 디지털 환경",
    vendor: "HorizonFX",
    complexity: "hero",
    versions: 1,
    status: "pending",
  },
];
