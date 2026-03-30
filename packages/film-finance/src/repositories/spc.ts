import type { PrismaClient } from "../generated/client/index.js";
import type {
  CreateSPCInput,
  CreateTrancheInput,
  CreateWaterfallTierInput,
  CreateRevenueEventInput,
} from "../models/types.js";

export class SPCRepository {
  constructor(private db: PrismaClient) {}

  async findAll(projectId?: string) {
    return this.db.sPC.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true, _count: { select: { tranches: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return this.db.sPC.findUnique({
      where: { id },
      include: {
        project: true,
        tranches: {
          include: {
            investors: { include: { investor: true } },
          },
          orderBy: { priority: "asc" },
        },
        waterfallTiers: {
          include: { tranche: true },
          orderBy: { priority: "asc" },
        },
        revenueEvents: { orderBy: { eventDate: "desc" } },
      },
    });
  }

  async create(input: CreateSPCInput) {
    return this.db.sPC.create({
      data: {
        projectId: input.projectId,
        name: input.name,
        legalType: input.legalType,
        registrationNumber: input.registrationNumber,
        incorporationDate: input.incorporationDate,
        totalCapital: input.totalCapital,
        totalBudget: input.totalBudget,
        notes: input.notes,
      },
    });
  }

  async update(id: string, input: Partial<Omit<CreateSPCInput, "projectId">>) {
    return this.db.sPC.update({ where: { id }, data: input });
  }

  // ── Tranches ───────────────────────────────────────────────────────────────

  async createTranche(input: CreateTrancheInput) {
    return this.db.pFTranche.create({ data: input });
  }

  async addInvestorToTranche(
    trancheId: string,
    investorId: string,
    amount: number,
    notes?: string
  ) {
    const tranche = await this.db.pFTranche.findUniqueOrThrow({
      where: { id: trancheId },
    });
    const percentage =
      tranche.targetAmount > 0 ? (amount / tranche.targetAmount) * 100 : null;

    const member = await this.db.pFTrancheInvestor.create({
      data: { trancheId, investorId, amount, percentage, notes },
    });

    // Update SPC raised amount
    await this.db.sPC.update({
      where: { id: tranche.spcId },
      data: { raisedAmount: { increment: amount } },
    });

    return member;
  }

  // ── Waterfall Tiers ────────────────────────────────────────────────────────

  async createWaterfallTier(input: CreateWaterfallTierInput) {
    return this.db.waterfallTier.create({ data: input as any });
  }

  async replaceWaterfallTiers(spcId: string, tiers: CreateWaterfallTierInput[]) {
    await this.db.waterfallTier.deleteMany({ where: { spcId } });
    return this.db.waterfallTier.createMany({
      data: tiers.map((t) => ({ ...t })) as any,
    });
  }

  // ── Revenue Events ─────────────────────────────────────────────────────────

  async createRevenueEvent(input: CreateRevenueEventInput) {
    return this.db.revenueEvent.create({ data: input });
  }

  async saveDistributions(
    eventId: string,
    distributions: Array<{
      tierId: string;
      tierName: string;
      tierPriority: number;
      allocatedAmount: number;
      cumulativePaid: number;
      isFullySatisfied: boolean;
    }>
  ) {
    await this.db.waterfallDistribution.createMany({
      data: distributions.map((d) => ({ eventId, ...d })),
    });
    await this.db.revenueEvent.update({
      where: { id: eventId },
      data: { distributionStatus: "distributed" },
    });
  }
}
