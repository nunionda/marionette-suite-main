// Location Contracts — Sprint 10 #19
// Covers signed / pending venue agreements for confirmed shoot locations.

export type ContractStatus = "draft" | "review" | "signed" | "expired";

export interface LocationContract {
  id: string;
  projectId: string;
  locationName: string;
  vendor: string;
  shootDates: string[];
  dailyRateKRW: number;
  totalFeeKRW: number;
  depositPaidKRW?: number;
  status: ContractStatus;
  signedDate?: string;
  expiresDate?: string;
  note?: string;
}

export const mockContracts: LocationContract[] = [
  // ID-001 DECODE
  {
    id: "LC-001-01",
    projectId: "ID-001",
    locationName: "강남 오피스",
    vendor: "한성 프로덕션 서비스",
    shootDates: ["2026-06-10", "2026-06-11", "2026-06-12"],
    dailyRateKRW: 3_500_000,
    totalFeeKRW: 10_500_000,
    depositPaidKRW: 5_250_000,
    status: "signed",
    signedDate: "2026-05-01",
    expiresDate: "2026-07-31",
    note: "오프닝 시퀀스 · 엘리베이터 포함 패키지",
  },
  {
    id: "LC-001-02",
    projectId: "ID-001",
    locationName: "해운대 해변",
    vendor: "부산 촬영 지원센터",
    shootDates: ["2026-06-15", "2026-06-16"],
    dailyRateKRW: 2_100_000,
    totalFeeKRW: 4_200_000,
    depositPaidKRW: 2_100_000,
    status: "signed",
    signedDate: "2026-04-28",
    expiresDate: "2026-07-20",
  },
  {
    id: "LC-001-03",
    projectId: "ID-001",
    locationName: "한남동 주택",
    vendor: "한남 헤리티지",
    shootDates: ["2026-06-18", "2026-06-19", "2026-06-20"],
    dailyRateKRW: 4_200_000,
    totalFeeKRW: 12_600_000,
    status: "review",
    note: "보증금 협상 중 — 최종 조율 필요",
  },
  {
    id: "LC-001-04",
    projectId: "ID-001",
    locationName: "교외 창고 (미정)",
    vendor: "TBD",
    shootDates: [],
    dailyRateKRW: 0,
    totalFeeKRW: 0,
    status: "draft",
    note: "3곳 답사 후 선정 예정",
  },
  // ID-002
  {
    id: "LC-002-01",
    projectId: "ID-002",
    locationName: "대구 동성로 카페",
    vendor: "카페 주인장 직접",
    shootDates: ["2026-07-06"],
    dailyRateKRW: 1_200_000,
    totalFeeKRW: 1_200_000,
    depositPaidKRW: 600_000,
    status: "signed",
    signedDate: "2026-05-10",
    expiresDate: "2026-08-01",
    note: "일요일 촬영 확정",
  },
];

export function findContractsByProject(projectId: string): LocationContract[] {
  return mockContracts.filter((c) => c.projectId === projectId);
}

export function summarizeContracts(contracts: LocationContract[]) {
  const total = contracts.length;
  const signed = contracts.filter((c) => c.status === "signed").length;
  const review = contracts.filter((c) => c.status === "review").length;
  const draft = contracts.filter((c) => c.status === "draft").length;
  const totalFeeKRW = contracts.reduce((s, c) => s + c.totalFeeKRW, 0);
  const depositPaidKRW = contracts.reduce(
    (s, c) => s + (c.depositPaidKRW ?? 0),
    0,
  );
  return { total, signed, review, draft, totalFeeKRW, depositPaidKRW };
}
