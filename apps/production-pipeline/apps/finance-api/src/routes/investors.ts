import { Elysia, t } from "elysia";
import {
  getFinanceDb,
  InvestorRepository,
  InvestorType,
  InvestorTier,
} from "@marionette/film-finance";

const db = getFinanceDb();
const repo = new InvestorRepository(db);

export const investorsRoutes = new Elysia({ prefix: "/investors" })
  .get(
    "/",
    async ({ query }) => {
      const list = await repo.findAll({
        type: query.type,
        tier: query.tier,
        status: query.status,
        search: query.search,
      });
      return { investors: list, count: list.length };
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        tier: t.Optional(t.String()),
        status: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  )
  .get("/:id", async ({ params, error }) => {
    const inv = await repo.findById(params.id);
    if (!inv) return error(404, { message: "Investor not found" });
    return inv;
  })
  .post(
    "/",
    async ({ body }) => {
      const inv = await repo.create({
        ...body,
        type: body.type as any,
        tier: body.tier as any,
      });
      return { investor: inv };
    },
    {
      body: t.Object({
        name: t.String(),
        nameEn: t.Optional(t.String()),
        type: t.String(),
        tier: t.Optional(t.String()),
        country: t.Optional(t.String()),
        region: t.Optional(t.String()),
        contactName: t.Optional(t.String()),
        contactEmail: t.Optional(t.String()),
        contactPhone: t.Optional(t.String()),
        investmentCapacity: t.Optional(t.Number()),
        minTicket: t.Optional(t.Number()),
        maxTicket: t.Optional(t.Number()),
        preferredGenres: t.Optional(t.Array(t.String())),
        preferredBudgetRange: t.Optional(
          t.Object({ min: t.Optional(t.Number()), max: t.Optional(t.Number()) })
        ),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params, body, error }) => {
      try {
        const inv = await repo.update(params.id, body as any);
        return { investor: inv };
      } catch {
        return error(404, { message: "Investor not found" });
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        nameEn: t.Optional(t.String()),
        tier: t.Optional(t.String()),
        status: t.Optional(t.String()),
        region: t.Optional(t.String()),
        contactName: t.Optional(t.String()),
        contactEmail: t.Optional(t.String()),
        investmentCapacity: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params, error }) => {
    try {
      await repo.delete(params.id);
      return { deleted: true };
    } catch {
      return error(404, { message: "Investor not found" });
    }
  });
