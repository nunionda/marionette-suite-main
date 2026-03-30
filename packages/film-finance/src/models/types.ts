// ─── Re-export Prisma enums & types ──────────────────────────────────────────

export type {
  Investor,
  InvestorGroup,
  InvestorGroupMember,
  FilmProject,
  SPC,
  PFTranche,
  PFTrancheInvestor,
  WaterfallTier,
  RevenueEvent,
  WaterfallDistribution,
} from "../generated/client/index.js";

export {
  InvestorType,
  InvestorTier,
  InvestorStatus,
  InvestorGroupType,
  InvestorGroupStatus,
  ProjectStatus,
  SPCLegalType,
  SPCStatus,
  TrancheType,
  TrancheStatus,
  TierType,
  RevenueSource,
} from "../generated/client/index.js";

// ─── Domain DTOs ─────────────────────────────────────────────────────────────

export interface CreateInvestorInput {
  name: string;
  nameEn?: string;
  type: import("../generated/client/index.js").InvestorType;
  tier?: import("../generated/client/index.js").InvestorTier;
  country?: string;
  region?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  investmentCapacity?: number;
  minTicket?: number;
  maxTicket?: number;
  preferredGenres?: string[];
  preferredBudgetRange?: { min?: number; max?: number };
  pastInvestments?: PastInvestment[];
  notes?: string;
}

export interface PastInvestment {
  title: string;
  year: number;
  amount?: number; // 만원
  role?: string;   // "선순위" | "지분" | "공동제작"
}

export interface CreateProjectInput {
  title: string;
  titleEn?: string;
  genre?: string;
  logline?: string;
  totalBudget?: number;
  budgetBreakdown?: BudgetBreakdown;
  targetReleaseDate?: string;
  scriptId?: string;
  notes?: string;
}

export interface BudgetBreakdown {
  pre?: number;       // 프리프로덕션
  main?: number;      // 본제작
  post?: number;      // 포스트프로덕션
  marketing?: number; // 마케팅/홍보
  contingency?: number; // 예비비
}

export interface CreateSPCInput {
  projectId: string;
  name: string;
  legalType?: import("../generated/client/index.js").SPCLegalType;
  registrationNumber?: string;
  incorporationDate?: string;
  totalCapital?: number;
  totalBudget?: number;
  notes?: string;
}

export interface CreateTrancheInput {
  spcId: string;
  name: string;
  type: import("../generated/client/index.js").TrancheType;
  priority: number;
  targetAmount: number;
  interestRate?: number;
  targetReturn?: number;
  termMonths?: number;
  notes?: string;
}

export interface CreateWaterfallTierInput {
  spcId: string;
  priority: number;
  name: string;
  type: import("../generated/client/index.js").TierType;
  trancheId?: string;
  amountCap?: number;
  percentage?: number;
  multiplier?: number;
  description?: string;
}

export interface CreateRevenueEventInput {
  spcId: string;
  amount: number;
  source: import("../generated/client/index.js").RevenueSource;
  eventDate: string;
  notes?: string;
}

// ─── Waterfall Simulation Types ──────────────────────────────────────────────

export interface WaterfallSimulationInput {
  spcId: string;
  /// 가상 수익액 (만원) — 실제 RevenueEvent 없이 시뮬레이션
  hypotheticalRevenue?: number;
  /// 기존 누적 수익도 포함할지 여부
  includePastRevenue?: boolean;
}

export interface TierAllocation {
  tierId: string;
  tierName: string;
  tierType: string;
  priority: number;
  allocated: number;      // 이번에 배분 (만원)
  cumulative: number;     // 누적 배분 (만원)
  cap: number | null;     // 상한 (만원)
  satisfied: boolean;     // 상한 도달 여부
  trancheName?: string;   // 연결된 트란쉐
}

export interface WaterfallSimulationResult {
  spcId: string;
  totalRevenue: number;   // 만원
  totalAllocated: number; // 만원
  unallocated: number;    // 분배 후 잔여 (만원)
  tiers: TierAllocation[];
  /// 투자자별 최종 수익
  investorReturns: InvestorReturn[];
}

export interface InvestorReturn {
  investorId: string;
  investorName: string;
  trancheName: string;
  trancheType: string;
  principal: number;     // 원금 (만원)
  returned: number;      // 수익 배분액 (만원)
  roi: number;           // ROI % ((returned - principal) / principal * 100)
  multiple: number;      // 투자 배수 (returned / principal)
}

// ─── IR Report ───────────────────────────────────────────────────────────────

export interface IRReport {
  project: {
    id: string;
    title: string;
    genre: string | null;
    logline: string | null;
    status: string;
    totalBudget: number | null;
  };
  spc: {
    id: string;
    name: string;
    legalType: string;
    totalBudget: number | null;
    raisedAmount: number;
    fundingProgress: number; // %
    status: string;
  };
  tranches: Array<{
    name: string;
    type: string;
    priority: number;
    targetAmount: number;
    raisedAmount: number;
    interestRate: number | null;
    targetReturn: number | null;
    investorCount: number;
  }>;
  waterfallSummary: WaterfallSimulationResult | null;
  generatedAt: string;
}
