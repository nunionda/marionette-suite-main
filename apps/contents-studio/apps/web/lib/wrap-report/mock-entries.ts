// Wrap Report — Sprint 11 #41
// 촬영 완료 후 종합 랩 보고서

export type WrapStatus = "in-progress" | "draft" | "final" | "delivered";

export interface WrapReport {
  id: string;
  projectId: string;
  shootingDays: number;
  plannedDays: number;
  totalPagesShot: number;
  totalSetups: number;
  principalWrapDate?: string;
  postHandoffDate?: string;
  overUnderBudgetKRW?: number; // negative = under budget
  status: WrapStatus;
  preparedBy?: string;
  highlights?: string[];
  note?: string;
}

export const mockWrapReports: WrapReport[] = [
  {
    id: "WR-001",
    projectId: "ID-001",
    shootingDays: 32,
    plannedDays: 30,
    totalPagesShot: 118,
    totalSetups: 1240,
    principalWrapDate: "2026-09-05",
    overUnderBudgetKRW: 45_000_000, // 4500만원 초과
    status: "draft",
    preparedBy: "오혜진 (UPM)",
    highlights: [
      "클라이맥스 시퀀스 3일 연장 촬영",
      "2일차 우천 인도어 대체 성공",
      "VFX 레퍼런스 플레이트 전량 확보",
    ],
    note: "감독 최종 검토 후 승인 예정",
  },
  {
    id: "WR-002",
    projectId: "ID-002",
    shootingDays: 18,
    plannedDays: 20,
    totalPagesShot: 88,
    totalSetups: 720,
    principalWrapDate: "2026-08-10",
    postHandoffDate: "2026-08-12",
    overUnderBudgetKRW: -12_000_000, // 1200만원 절감
    status: "final",
    preparedBy: "제작부장",
    highlights: ["2일 조기 완료", "예산 절감"],
  },
];

export function findWrapByProject(projectId: string): WrapReport | undefined {
  return mockWrapReports.find((w) => w.projectId === projectId);
}

export const STATUS_COLOR: Record<WrapStatus, string> = {
  "in-progress": "#707070",
  draft: "#facc15",
  final: "#60a5fa",
  delivered: "#00FF41",
};

export const STATUS_LABEL: Record<WrapStatus, string> = {
  "in-progress": "진행 중",
  draft: "초안",
  final: "확정",
  delivered: "인도 완료",
};
