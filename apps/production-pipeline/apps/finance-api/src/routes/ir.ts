import { Elysia } from "elysia";
import {
  getFinanceDb,
  SPCRepository,
  FilmProjectRepository,
  simulateWaterfall,
  type IRReport,
} from "@marionette/film-finance";

const db = getFinanceDb();
const spcRepo = new SPCRepository(db);
const projectRepo = new FilmProjectRepository(db);

export const irRoutes = new Elysia({ prefix: "/ir" })
  /**
   * GET /ir/:projectId
   * Full Investor Relations report for a project.
   * Includes SPC summary, tranche breakdown, and waterfall simulation
   * at multiple revenue scenarios (break-even, 1x, 2x, 3x budget).
   */
  .get("/:projectId", async ({ params, error }) => {
    const project = await projectRepo.findById(params.projectId);
    if (!project) return error(404, { message: "Project not found" });

    const spc = project.spcs[0];
    if (!spc) return error(404, { message: "No SPC found for this project" });

    const fullSpc = await spcRepo.findById(spc.id);
    if (!fullSpc) return error(404, { message: "SPC not found" });

    const budget = project.totalBudget ?? 0;

    // Scenarios: 0.5x, 1x, 1.5x, 2x, 3x budget
    const scenarios = [0.5, 1, 1.5, 2, 3].map((multiplier) => {
      const revenue = Math.floor(budget * multiplier);
      const result = simulateWaterfall(fullSpc as any, {
        hypotheticalRevenue: revenue,
        includePastRevenue: false,
      });
      return {
        label: `${multiplier}x 제작비 (${(revenue / 10000).toFixed(0)}억)`,
        multiplier,
        revenue,
        simulation: result,
      };
    });

    const report: IRReport = {
      project: {
        id: project.id,
        title: project.title,
        genre: project.genre,
        logline: project.logline,
        status: project.status,
        totalBudget: project.totalBudget,
      },
      spc: {
        id: fullSpc.id,
        name: fullSpc.name,
        legalType: fullSpc.legalType,
        totalBudget: fullSpc.totalBudget,
        raisedAmount: fullSpc.raisedAmount,
        fundingProgress:
          fullSpc.totalBudget && fullSpc.totalBudget > 0
            ? Math.round((fullSpc.raisedAmount / fullSpc.totalBudget) * 100)
            : 0,
        status: fullSpc.status,
      },
      tranches: fullSpc.tranches.map((t) => ({
        name: t.name,
        type: t.type,
        priority: t.priority,
        targetAmount: t.targetAmount,
        raisedAmount: t.raisedAmount,
        interestRate: t.interestRate,
        targetReturn: t.targetReturn,
        investorCount: t.investors.length,
      })),
      waterfallSummary: scenarios.find((s) => s.multiplier === 1)?.simulation ?? null,
      generatedAt: new Date().toISOString(),
    };

    return {
      report,
      scenarios,
    };
  })

  /**
   * GET /ir/:projectId/summary
   * Lightweight funding status for dashboard widgets.
   */
  .get("/:projectId/summary", async ({ params, error }) => {
    const project = await projectRepo.findById(params.projectId);
    if (!project) return error(404, { message: "Project not found" });

    const spcList = project.spcs ?? [];
    const totalRaised = spcList.reduce((sum, s) => sum + s.raisedAmount, 0);
    const totalTarget = spcList.reduce((sum, s) => sum + (s.totalBudget ?? 0), 0);

    return {
      projectId: project.id,
      title: project.title,
      status: project.status,
      totalBudget: project.totalBudget,
      totalRaised,
      totalTarget,
      fundingProgress: totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0,
      spcCount: spcList.length,
    };
  });
