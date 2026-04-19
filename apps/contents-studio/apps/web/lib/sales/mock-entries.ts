// Sales / Distribution Deal — Sprint 11 #63
// 세일즈 에이전트 및 배급 계약

export type DealStatus = "prospecting" | "in-negotiation" | "loi" | "signed" | "closed";
export type DealTerritory =
  | "KR"
  | "US"
  | "EU"
  | "JAPAN"
  | "CHINA"
  | "ASIA"
  | "MENA"
  | "LATAM"
  | "WORLD";
export type DealType = "theatrical" | "streaming" | "broadcast" | "home-video" | "airline" | "all-rights";

export interface SalesDeal {
  id: string;
  projectId: string;
  buyer: string;
  agentOrSeller?: string;
  dealType: DealType;
  territory: DealTerritory;
  minGuaranteeKRW?: number;
  advanceKRW?: number;
  revSharePct?: number;
  status: DealStatus;
  dealDate?: string;
  deliveryDeadline?: string;
  note?: string;
}

export const mockSalesDeals: SalesDeal[] = [
  // ID-001 DECODE
  {
    id: "SD-001-01",
    projectId: "ID-001",
    buyer: "CGV Arthouse",
    agentOrSeller: "Finecut",
    dealType: "theatrical",
    territory: "KR",
    minGuaranteeKRW: 500_000_000,
    revSharePct: 50,
    status: "signed",
    dealDate: "2026-10-15",
    deliveryDeadline: "2027-02-28",
  },
  {
    id: "SD-001-02",
    projectId: "ID-001",
    buyer: "Netflix Korea",
    agentOrSeller: "Finecut",
    dealType: "streaming",
    territory: "WORLD",
    minGuaranteeKRW: 2_000_000_000,
    status: "in-negotiation",
    note: "극장 개봉 90일 홀드백 조건",
  },
  {
    id: "SD-001-03",
    projectId: "ID-001",
    buyer: "Wild Bunch",
    agentOrSeller: "Finecut",
    dealType: "all-rights",
    territory: "EU",
    minGuaranteeKRW: 350_000_000,
    status: "loi",
    note: "LOI 서명 완료, 본계약 작성 중",
  },
  {
    id: "SD-001-04",
    projectId: "ID-001",
    buyer: "Toho International",
    dealType: "theatrical",
    territory: "JAPAN",
    status: "prospecting",
    note: "BIFAN 상영 후 미팅 예정",
  },
  // ID-002
  {
    id: "SD-002-01",
    projectId: "ID-002",
    buyer: "Wavve",
    dealType: "streaming",
    territory: "KR",
    minGuaranteeKRW: 300_000_000,
    status: "in-negotiation",
  },
];

export function findDealsByProject(projectId: string): SalesDeal[] {
  return mockSalesDeals.filter((d) => d.projectId === projectId);
}

export function summarizeDeals(deals: SalesDeal[]) {
  const total = deals.length;
  const signed = deals.filter((d) => d.status === "signed" || d.status === "closed").length;
  const totalMG = deals
    .filter((d) => d.status === "signed" || d.status === "closed")
    .reduce((s, d) => s + (d.minGuaranteeKRW ?? 0), 0);
  return { total, signed, totalMG };
}

export const DEAL_TYPE_LABEL: Record<DealType, string> = {
  theatrical: "극장",
  streaming: "스트리밍",
  broadcast: "방송",
  "home-video": "홈 비디오",
  airline: "항공",
  "all-rights": "전 권리",
};

export const STATUS_COLOR: Record<DealStatus, string> = {
  prospecting: "#707070",
  "in-negotiation": "#facc15",
  loi: "#a78bfa",
  signed: "#60a5fa",
  closed: "#00FF41",
};

export const STATUS_LABEL: Record<DealStatus, string> = {
  prospecting: "탐색 중",
  "in-negotiation": "협상 중",
  loi: "LOI",
  signed: "계약 완료",
  closed: "완결",
};
