import type { PrismaClient } from "../generated/client/index.js";
import type { CreateProjectInput, BudgetBreakdown } from "../models/types.js";

export class FilmProjectRepository {
  constructor(private db: PrismaClient) {}

  async findAll(status?: string) {
    return this.db.filmProject.findMany({
      where: status ? { status: status as any } : undefined,
      include: { _count: { select: { spcs: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return this.db.filmProject.findUnique({
      where: { id },
      include: {
        spcs: {
          include: {
            tranches: {
              include: { investors: { include: { investor: true } } },
              orderBy: { priority: "asc" },
            },
          },
        },
      },
    });
  }

  async create(input: CreateProjectInput) {
    return this.db.filmProject.create({
      data: {
        title: input.title,
        titleEn: input.titleEn,
        genre: input.genre,
        logline: input.logline,
        totalBudget: input.totalBudget,
        budgetBreakdown: JSON.stringify(input.budgetBreakdown ?? {}),
        targetReleaseDate: input.targetReleaseDate,
        scriptId: input.scriptId,
        notes: input.notes,
      },
    });
  }

  async update(id: string, input: Partial<CreateProjectInput>) {
    return this.db.filmProject.update({
      where: { id },
      data: {
        ...input,
        ...(input.budgetBreakdown !== undefined
          ? { budgetBreakdown: JSON.stringify(input.budgetBreakdown) }
          : {}),
      },
    });
  }
}
