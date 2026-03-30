import { Elysia, t } from "elysia";
import {
  getFinanceDb,
  SPCRepository,
  simulateWaterfall,
  buildStandardKoreanPFWaterfall,
} from "@marionette/film-finance";

const db = getFinanceDb();
const repo = new SPCRepository(db);

export const spcRoutes = new Elysia({ prefix: "/spc" })
  // ── SPC CRUD ──────────────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const list = await repo.findAll(query.projectId);
      return { spcs: list, count: list.length };
    },
    { query: t.Object({ projectId: t.Optional(t.String()) }) }
  )
  .get("/:id", async ({ params, error }) => {
    const spc = await repo.findById(params.id);
    if (!spc) return error(404, { message: "SPC not found" });
    return spc;
  })
  .post(
    "/",
    async ({ body }) => {
      const spc = await repo.create(body as any);
      return { spc };
    },
    {
      body: t.Object({
        projectId: t.String(),
        name: t.String(),
        legalType: t.Optional(t.String()),
        registrationNumber: t.Optional(t.String()),
        incorporationDate: t.Optional(t.String()),
        totalCapital: t.Optional(t.Number()),
        totalBudget: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const spc = await repo.update(params.id, body as any);
      return { spc };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        status: t.Optional(t.String()),
        totalCapital: t.Optional(t.Number()),
        totalBudget: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    }
  )

  // ── Tranches ──────────────────────────────────────────────────────────────
  .post(
    "/:id/tranches",
    async ({ params, body }) => {
      const tranche = await repo.createTranche({
        spcId: params.id,
        ...body,
        type: body.type as any,
      });
      return { tranche };
    },
    {
      body: t.Object({
        name: t.String(),
        type: t.String(),
        priority: t.Number(),
        targetAmount: t.Number(),
        interestRate: t.Optional(t.Number()),
        targetReturn: t.Optional(t.Number()),
        termMonths: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/:id/tranches/:trancheId/investors",
    async ({ params, body }) => {
      const member = await repo.addInvestorToTranche(
        params.trancheId,
        body.investorId,
        body.amount,
        body.notes
      );
      return { member };
    },
    {
      body: t.Object({
        investorId: t.String(),
        amount: t.Number(),
        notes: t.Optional(t.String()),
      }),
    }
  )

  // ── Waterfall Tiers ───────────────────────────────────────────────────────
  .post(
    "/:id/waterfall/auto",
    async ({ params, error }) => {
      const spc = await repo.findById(params.id);
      if (!spc) return error(404, { message: "SPC not found" });

      const tiers = buildStandardKoreanPFWaterfall(
        spc.id,
        spc.tranches.map((t) => ({
          id: t.id,
          name: t.name,
          type: t.type,
          priority: t.priority,
        }))
      );

      await repo.replaceWaterfallTiers(spc.id, tiers as any);
      return { message: "Waterfall tiers generated", count: tiers.length, tiers };
    }
  )
  .post(
    "/:id/waterfall/tiers",
    async ({ params, body }) => {
      const tier = await repo.createWaterfallTier({
        spcId: params.id,
        ...body,
        type: body.type as any,
      });
      return { tier };
    },
    {
      body: t.Object({
        priority: t.Number(),
        name: t.String(),
        type: t.String(),
        trancheId: t.Optional(t.String()),
        amountCap: t.Optional(t.Number()),
        percentage: t.Optional(t.Number()),
        multiplier: t.Optional(t.Number()),
        description: t.Optional(t.String()),
      }),
    }
  )

  // ── Revenue Events ────────────────────────────────────────────────────────
  .post(
    "/:id/revenue",
    async ({ params, body }) => {
      const event = await repo.createRevenueEvent({
        spcId: params.id,
        ...body,
        source: body.source as any,
      });
      return { event };
    },
    {
      body: t.Object({
        amount: t.Number(),
        source: t.String(),
        eventDate: t.String(),
        notes: t.Optional(t.String()),
      }),
    }
  )

  // ── Waterfall Simulation ──────────────────────────────────────────────────
  .get(
    "/:id/simulate",
    async ({ params, query, error }) => {
      const spc = await repo.findById(params.id);
      if (!spc) return error(404, { message: "SPC not found" });

      const result = simulateWaterfall(spc as any, {
        hypotheticalRevenue: query.revenue ? Number(query.revenue) : undefined,
        includePastRevenue: query.includePast === "true",
      });

      return result;
    },
    {
      query: t.Object({
        revenue: t.Optional(t.String()),
        includePast: t.Optional(t.String()),
      }),
    }
  )

  // ── Distribute Revenue Event ──────────────────────────────────────────────
  .post(
    "/:id/revenue/:eventId/distribute",
    async ({ params, error }) => {
      const spc = await repo.findById(params.id);
      if (!spc) return error(404, { message: "SPC not found" });

      const event = spc.revenueEvents.find((e) => e.id === params.eventId);
      if (!event) return error(404, { message: "Revenue event not found" });

      const result = simulateWaterfall(spc as any, {
        hypotheticalRevenue: (event as any).amount,
        includePastRevenue: false,
      });

      await repo.saveDistributions(
        params.eventId,
        result.tiers.map((t) => ({
          tierId: t.tierId,
          tierName: t.tierName,
          tierPriority: t.priority,
          allocatedAmount: t.allocated,
          cumulativePaid: t.cumulative,
          isFullySatisfied: t.satisfied,
        }))
      );

      return { distributed: true, result };
    }
  );
