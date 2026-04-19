// Rights / Clearances module — Charter #11
// Mock data. Future sprints will back this with a DB.

export type RightsStatus = "clear" | "pending" | "issue" | "not_applicable";

export interface RightsItem {
  type: "script_ip" | "music" | "footage" | "trademark" | "location" | "likeness" | "adaptation";
  description: string;
  status: RightsStatus;
  owner?: string;
  clearanceDate?: string; // ISO
  note?: string;
}

export interface RightsEntry {
  projectId: string;
  overallStatus: RightsStatus;
  legalCounsel?: string;
  items: RightsItem[];
  updatedAt: string;
}

export const mockRights: RightsEntry[] = [
  {
    projectId: "ID-001",
    overallStatus: "clear",
    legalCounsel: "김앤장 법률사무소",
    items: [
      { type: "script_ip", description: "오리지널 각본 — 저작권 등록 완료", status: "clear", owner: "Nunionda Pictures", clearanceDate: "2025-10-01T00:00:00Z" },
      { type: "music", description: "OST 전체 — 위탁 작곡 계약", status: "clear", clearanceDate: "2025-11-15T00:00:00Z" },
      { type: "trademark", description: "DECODE 타이틀 상표 출원", status: "pending", note: "특허청 심사 중 (예상 완료: 2026-06)" },
      { type: "footage", description: "다큐멘터리 참고 영상 (레퍼런스용)", status: "not_applicable", note: "리서치용으로만 사용, 최종 편집 미포함" },
    ],
    updatedAt: "2026-01-20T10:00:00Z",
  },
  {
    projectId: "ID-002",
    overallStatus: "pending",
    legalCounsel: "법무법인 태평양",
    items: [
      { type: "script_ip", description: "오리지널 각본", status: "clear", owner: "Nunionda Pictures", clearanceDate: "2025-12-01T00:00:00Z" },
      { type: "music", description: "실제 K-POP 트랙 샘플 사용 검토", status: "pending", note: "HYBE / SM 라이선스 협상 중" },
      { type: "likeness", description: "실제 아이돌 모션 캡처 참고 동의", status: "issue", note: "초상권 계약 재협상 필요" },
    ],
    updatedAt: "2026-02-28T09:00:00Z",
  },
];

export function findRightsByProject(projectId: string): RightsEntry | undefined {
  return mockRights.find((r) => r.projectId === projectId);
}
