import type { SPC, PFTranche, WaterfallTier, PFTrancheInvestor, Investor } from "../generated/client/index.js";
import type {
  WaterfallSimulationInput,
  WaterfallSimulationResult,
  TierAllocation,
  InvestorReturn,
} from "../models/types.js";

// ─── Types for full SPC with relations ──────────────────────────────────────

interface SPCWithRelations extends SPC {
  tranches: TrancheWithInvestors[];
  waterfallTiers: WaterfallTier[];
  revenueEvents: Array<{ amount: number; distributionStatus: string }>;
}

interface TrancheWithInvestors extends PFTranche {
  investors: Array<PFTrancheInvestor & { investor: Investor }>;
}

// ─── Core Waterfall Simulator ────────────────────────────────────────────────

/**
 * Korean film PF waterfall simulator.
 *
 * Priority order (typical Korean PF):
 *   1. Senior loan principal + interest (선순위 원금/이자)
 *   2. Mezzanine preferred return (메자닌 우선수익)
 *   3. Expense recovery (비용 정산)
 *   4. Equity split (지분 배분)
 *
 * All amounts in 만원 (KRW 10,000 units).
 */
export function simulateWaterfall(
  spc: SPCWithRelations,
  input: Pick<WaterfallSimulationInput, "hypotheticalRevenue" | "includePastRevenue">
): WaterfallSimulationResult {
  // 1. Compute total revenue pool
  let totalRevenue = input.hypotheticalRevenue ?? 0;

  if (input.includePastRevenue) {
    const pastRevenue = spc.revenueEvents
      .filter((e) => e.distributionStatus === "pending")
      .reduce((sum, e) => sum + e.amount, 0);
    totalRevenue += pastRevenue;
  }

  // 2. Sort tiers by priority ascending (1 = first to receive)
  const tiers = [...spc.waterfallTiers].sort((a, b) => a.priority - b.priority);

  const trancheMap = new Map<string, TrancheWithInvestors>(
    spc.tranches.map((t) => [t.id, t])
  );

  // 3. Cumulative tracking per tier
  const tierCumulativePaid = new Map<string, number>();

  let remaining = totalRevenue;
  const allocations: TierAllocation[] = [];

  for (const tier of tiers) {
    if (remaining <= 0) {
      allocations.push({
        tierId: tier.id,
        tierName: tier.name,
        tierType: tier.type,
        priority: tier.priority,
        allocated: 0,
        cumulative: tierCumulativePaid.get(tier.id) ?? 0,
        cap: tier.amountCap ?? null,
        satisfied: false,
        trancheName: tier.trancheId
          ? trancheMap.get(tier.trancheId)?.name
          : undefined,
      });
      continue;
    }

    const prevCumulative = tierCumulativePaid.get(tier.id) ?? 0;
    let allocatable = remaining;

    // Apply cap: tier can receive at most (amountCap - already paid)
    if (tier.amountCap != null) {
      const headroom = tier.amountCap - prevCumulative;
      if (headroom <= 0) {
        // Already fully satisfied
        allocations.push({
          tierId: tier.id,
          tierName: tier.name,
          tierType: tier.type,
          priority: tier.priority,
          allocated: 0,
          cumulative: prevCumulative,
          cap: tier.amountCap,
          satisfied: true,
          trancheName: tier.trancheId
            ? trancheMap.get(tier.trancheId)?.name
            : undefined,
        });
        continue;
      }
      allocatable = Math.min(remaining, headroom);
    } else if (tier.percentage != null) {
      // Percentage of remaining pool
      allocatable = Math.floor(remaining * (tier.percentage / 100));
    }

    // For principal-based tiers, cap at tranche targetAmount if no explicit amountCap
    if (tier.type === "loan_repayment" && !tier.amountCap && tier.trancheId) {
      const tranche = trancheMap.get(tier.trancheId);
      if (tranche) {
        const principalDue = computePrincipalDue(tranche);
        const headroom = principalDue - prevCumulative;
        allocatable = Math.min(allocatable, Math.max(0, headroom));
      }
    }

    if (tier.type === "preferred_return" && !tier.amountCap && tier.trancheId) {
      const tranche = trancheMap.get(tier.trancheId);
      if (tranche) {
        const returnDue = computePreferredReturn(tranche);
        const headroom = returnDue - prevCumulative;
        allocatable = Math.min(allocatable, Math.max(0, headroom));
      }
    }

    allocatable = Math.max(0, Math.floor(allocatable));

    const newCumulative = prevCumulative + allocatable;
    tierCumulativePaid.set(tier.id, newCumulative);
    remaining -= allocatable;

    const satisfied =
      tier.amountCap != null
        ? newCumulative >= tier.amountCap
        : tier.type === "loan_repayment" || tier.type === "preferred_return"
        ? allocatable < remaining + allocatable // didn't take all remaining
        : false;

    allocations.push({
      tierId: tier.id,
      tierName: tier.name,
      tierType: tier.type,
      priority: tier.priority,
      allocated: allocatable,
      cumulative: newCumulative,
      cap: tier.amountCap ?? null,
      satisfied,
      trancheName: tier.trancheId
        ? trancheMap.get(tier.trancheId)?.name
        : undefined,
    });
  }

  const totalAllocated = totalRevenue - remaining;

  // 4. Build investor returns from tier allocations
  const investorReturns = computeInvestorReturns(
    allocations,
    spc.tranches,
    trancheMap
  );

  return {
    spcId: spc.id,
    totalRevenue,
    totalAllocated,
    unallocated: remaining,
    tiers: allocations,
    investorReturns,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computePrincipalDue(tranche: PFTranche): number {
  // For senior/mezzanine, due = targetAmount
  return tranche.targetAmount;
}

function computePreferredReturn(tranche: PFTranche): number {
  if (!tranche.interestRate || !tranche.termMonths) {
    return 0;
  }
  // Simple interest: principal * rate * (months / 12)
  const principal = tranche.targetAmount;
  const annualRate = tranche.interestRate / 100;
  const years = tranche.termMonths / 12;
  return Math.floor(principal * annualRate * years);
}

function computeInvestorReturns(
  allocations: TierAllocation[],
  tranches: TrancheWithInvestors[],
  trancheMap: Map<string, TrancheWithInvestors>
): InvestorReturn[] {
  const returns: InvestorReturn[] = [];

  for (const tranche of tranches) {
    if (tranche.investors.length === 0) continue;

    // Sum all tier allocations for this tranche
    const trancheAllocated = allocations
      .filter((a) => a.trancheName === tranche.name || (a as any).trancheId === tranche.id)
      .reduce((sum, a) => sum + a.allocated, 0);

    const totalTranchePrincipal = tranche.investors.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    for (const inv of tranche.investors) {
      const share =
        totalTranchePrincipal > 0 ? inv.amount / totalTranchePrincipal : 0;
      const returned = Math.floor(trancheAllocated * share);
      const roi =
        inv.amount > 0
          ? ((returned - inv.amount) / inv.amount) * 100
          : 0;
      const multiple = inv.amount > 0 ? returned / inv.amount : 0;

      returns.push({
        investorId: inv.investorId,
        investorName: inv.investor.name,
        trancheName: tranche.name,
        trancheType: tranche.type,
        principal: inv.amount,
        returned,
        roi: Math.round(roi * 10) / 10,
        multiple: Math.round(multiple * 100) / 100,
      });
    }
  }

  return returns;
}

// ─── Quick Scenario Builder ──────────────────────────────────────────────────

/**
 * Generate a standard Korean PF waterfall tier set for a new SPC.
 * Returns CreateWaterfallTierInput[] to be persisted.
 */
export function buildStandardKoreanPFWaterfall(
  spcId: string,
  tranches: Array<{ id: string; name: string; type: string; priority: number }>
): Array<{
  spcId: string;
  priority: number;
  name: string;
  type: string;
  trancheId?: string;
  description?: string;
}> {
  const tiers = [];
  let priority = 1;

  // Senior tranches: loan repayment first
  const seniors = tranches
    .filter((t) => t.type === "senior")
    .sort((a, b) => a.priority - b.priority);

  for (const s of seniors) {
    tiers.push({
      spcId,
      priority: priority++,
      name: `${s.name} — 원금 상환`,
      type: "loan_repayment",
      trancheId: s.id,
      description: "선순위 대출 원금 전액 상환",
    });
    tiers.push({
      spcId,
      priority: priority++,
      name: `${s.name} — 이자 지급`,
      type: "preferred_return",
      trancheId: s.id,
      description: "선순위 약정 이자 지급",
    });
  }

  // Mezzanine tranches: principal + preferred return
  const mezzanines = tranches
    .filter((t) => t.type === "mezzanine")
    .sort((a, b) => a.priority - b.priority);

  for (const m of mezzanines) {
    tiers.push({
      spcId,
      priority: priority++,
      name: `${m.name} — 원금 회수`,
      type: "loan_repayment",
      trancheId: m.id,
      description: "메자닌 원금 회수",
    });
    tiers.push({
      spcId,
      priority: priority++,
      name: `${m.name} — 우선수익`,
      type: "preferred_return",
      trancheId: m.id,
      description: "메자닌 약정 우선수익 지급",
    });
  }

  // Equity tranches: pro-rata split
  const equities = tranches
    .filter((t) => t.type === "equity")
    .sort((a, b) => a.priority - b.priority);

  for (const e of equities) {
    tiers.push({
      spcId,
      priority: priority++,
      name: `${e.name} — 지분 배분`,
      type: "equity_split",
      trancheId: e.id,
      description: "잔여 수익 지분 비율 배분",
    });
  }

  return tiers;
}
