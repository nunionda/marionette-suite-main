// International Distribution — Sprint 11 #70
// 해외 배급 현황

export type IntlStatus = "not-started" | "agent-assigned" | "screened" | "deal-closed";
export type IntlRegion = "North America" | "Europe" | "Japan" | "China" | "Southeast Asia" | "MENA" | "Latin America" | "Australia/NZ";

export interface IntlDeal {
  id: string;
  projectId: string;
  region: IntlRegion;
  countries?: string[];
  agent?: string;
  buyer?: string;
  dealType: "theatrical" | "streaming" | "broadcast" | "all-rights";
  minGuaranteeUSD?: number;
  status: IntlStatus;
  premiereFestival?: string;
  releaseDate?: string;
  note?: string;
}

export const mockIntlDeals: IntlDeal[] = [
  // ID-001 DECODE
  {
    id: "ID-001-NA",
    projectId: "ID-001",
    region: "North America",
    countries: ["US", "CA"],
    agent: "CAA Media Finance",
    buyer: "MUBI",
    dealType: "streaming",
    minGuaranteeUSD: 180_000,
    status: "deal-closed",
    premiereFestival: "Sundance 2027",
    note: "MUBI 글로벌 스트리밍 독점",
  },
  {
    id: "ID-001-EU",
    projectId: "ID-001",
    region: "Europe",
    agent: "Wild Bunch International",
    dealType: "all-rights",
    minGuaranteeUSD: 250_000,
    status: "agent-assigned",
    note: "Cannes 2027 마켓 미팅 예정",
  },
  {
    id: "ID-001-JP",
    projectId: "ID-001",
    region: "Japan",
    agent: "Nikkatsu",
    dealType: "theatrical",
    status: "screened",
    premiereFestival: "Tokyo IFF 2027",
    note: "배급사 최종 결정 대기",
  },
  {
    id: "ID-001-SEA",
    projectId: "ID-001",
    region: "Southeast Asia",
    dealType: "streaming",
    status: "not-started",
    note: "Netflix SEA 피치 예정",
  },
  {
    id: "ID-001-MENA",
    projectId: "ID-001",
    region: "MENA",
    dealType: "broadcast",
    status: "not-started",
  },
  // ID-002
  {
    id: "ID-002-NA",
    projectId: "ID-002",
    region: "North America",
    dealType: "streaming",
    status: "not-started",
  },
];

export function findIntlByProject(projectId: string): IntlDeal[] {
  return mockIntlDeals.filter((d) => d.projectId === projectId);
}

export function summarizeIntl(deals: IntlDeal[]) {
  const total = deals.length;
  const closed = deals.filter((d) => d.status === "deal-closed").length;
  const totalUSD = deals
    .filter((d) => d.status === "deal-closed")
    .reduce((s, d) => s + (d.minGuaranteeUSD ?? 0), 0);
  return { total, closed, totalUSD };
}

export const STATUS_COLOR: Record<IntlStatus, string> = {
  "not-started": "#707070",
  "agent-assigned": "#facc15",
  screened: "#a78bfa",
  "deal-closed": "#00FF41",
};

export const STATUS_LABEL: Record<IntlStatus, string> = {
  "not-started": "미착수",
  "agent-assigned": "에이전트 배정",
  screened: "상영 완료",
  "deal-closed": "계약 완료",
};
