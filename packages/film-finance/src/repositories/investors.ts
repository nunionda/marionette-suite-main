import type { PrismaClient } from "../generated/client/index.js";
import type { CreateInvestorInput } from "../models/types.js";

export class InvestorRepository {
  constructor(private db: PrismaClient) {}

  async findAll(filters?: {
    type?: string;
    tier?: string;
    status?: string;
    search?: string;
  }) {
    return this.db.investor.findMany({
      where: {
        ...(filters?.type ? { type: filters.type as any } : {}),
        ...(filters?.tier ? { tier: filters.tier as any } : {}),
        ...(filters?.status ? { status: filters.status as any } : {}),
        ...(filters?.search
          ? {
              OR: [
                { name: { contains: filters.search } },
                { nameEn: { contains: filters.search } },
                { contactName: { contains: filters.search } },
              ],
            }
          : {}),
      },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });
  }

  async findById(id: string) {
    return this.db.investor.findUnique({
      where: { id },
      include: {
        groupMemberships: { include: { group: true } },
        tranchePositions: { include: { tranche: { include: { spc: true } } } },
      },
    });
  }

  async create(input: CreateInvestorInput) {
    return this.db.investor.create({
      data: {
        name: input.name,
        nameEn: input.nameEn,
        type: input.type,
        tier: input.tier,
        country: input.country ?? "KR",
        region: input.region,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        investmentCapacity: input.investmentCapacity,
        minTicket: input.minTicket,
        maxTicket: input.maxTicket,
        preferredGenres: JSON.stringify(input.preferredGenres ?? []),
        preferredBudgetRange: JSON.stringify(input.preferredBudgetRange ?? {}),
        pastInvestments: JSON.stringify(input.pastInvestments ?? []),
        notes: input.notes,
      },
    });
  }

  async update(id: string, input: Partial<CreateInvestorInput>) {
    return this.db.investor.update({
      where: { id },
      data: {
        ...input,
        ...(input.preferredGenres !== undefined
          ? { preferredGenres: JSON.stringify(input.preferredGenres) }
          : {}),
        ...(input.preferredBudgetRange !== undefined
          ? { preferredBudgetRange: JSON.stringify(input.preferredBudgetRange) }
          : {}),
        ...(input.pastInvestments !== undefined
          ? { pastInvestments: JSON.stringify(input.pastInvestments) }
          : {}),
      },
    });
  }

  async delete(id: string) {
    return this.db.investor.delete({ where: { id } });
  }
}
