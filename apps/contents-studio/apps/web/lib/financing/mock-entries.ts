// Financing / Greenlight module — Charter #13
// Mock data. Future sprints will back this with a DB.

export type FinancingStatus = "seeking" | "partial" | "fully_financed" | "greenlit" | "on_hold";

export interface FinancingSource {
  source: string;
  type: "equity" | "debt" | "grant" | "presale" | "tax_incentive" | "crowdfunding";
  amount: number; // KRW
  percentage: number;
  status: "confirmed" | "pending" | "declined";
  closingDate?: string; // ISO
}

export interface FinancingEntry {
  projectId: string;
  status: FinancingStatus;
  totalBudget: number; // KRW
  currency: "KRW";
  totalRaised: number; // KRW
  greenlitDate?: string; // ISO
  greenlitBy?: string;
  sources: FinancingSource[];
  updatedAt: string;
}

export const mockFinancing: FinancingEntry[] = [
  {
    projectId: "ID-001",
    status: "greenlit",
    totalBudget: 8_500_000_000,
    currency: "KRW",
    totalRaised: 8_500_000_000,
    greenlitDate: "2025-11-15T00:00:00Z",
    greenlitBy: "CJ ENM / Nunionda Pictures",
    sources: [
      { source: "CJ ENM", type: "equity", amount: 4_250_000_000, percentage: 50, status: "confirmed", closingDate: "2025-11-10T00:00:00Z" },
      { source: "Nunionda Pictures", type: "equity", amount: 2_125_000_000, percentage: 25, status: "confirmed" },
      { source: "Netflix 선판매", type: "presale", amount: 1_700_000_000, percentage: 20, status: "confirmed", closingDate: "2025-12-01T00:00:00Z" },
      { source: "영화발전기금", type: "grant", amount: 425_000_000, percentage: 5, status: "confirmed" },
    ],
    updatedAt: "2025-12-01T12:00:00Z",
  },
  {
    projectId: "ID-002",
    status: "partial",
    totalBudget: 6_000_000_000,
    currency: "KRW",
    totalRaised: 2_400_000_000,
    sources: [
      { source: "Nunionda Pictures", type: "equity", amount: 1_200_000_000, percentage: 20, status: "confirmed" },
      { source: "JTBC Studios", type: "equity", amount: 1_200_000_000, percentage: 20, status: "pending" },
      { source: "Disney+ APAC 선판매", type: "presale", amount: 1_800_000_000, percentage: 30, status: "pending" },
      { source: "한국콘텐츠진흥원", type: "grant", amount: 300_000_000, percentage: 5, status: "pending" },
      { source: "크라우드펀딩", type: "crowdfunding", amount: 120_000_000, percentage: 2, status: "pending" },
      { source: "콘텐츠 세액공제 (25%)", type: "tax_incentive", amount: 1_380_000_000, percentage: 23, status: "confirmed" },
    ],
    updatedAt: "2026-03-01T11:00:00Z",
  },
];

export function findFinancingByProject(projectId: string): FinancingEntry | undefined {
  return mockFinancing.find((f) => f.projectId === projectId);
}
