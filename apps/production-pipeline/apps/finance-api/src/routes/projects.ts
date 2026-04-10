import { Elysia, t } from "elysia";
import { getFinanceDb, FilmProjectRepository } from "@marionette/film-finance";

const db = getFinanceDb();
const repo = new FilmProjectRepository(db);

export const projectsRoutes = new Elysia({ prefix: "/projects" })
  .get(
    "/",
    async ({ query }) => {
      const list = await repo.findAll(query.status);
      return { projects: list, count: list.length };
    },
    { query: t.Object({ status: t.Optional(t.String()) }) }
  )
  .get("/:id", async ({ params, error }) => {
    const proj = await repo.findById(params.id);
    if (!proj) return error(404, { message: "Project not found" });
    return proj;
  })
  .post(
    "/",
    async ({ body }) => {
      const proj = await repo.create(body as any);
      return { project: proj };
    },
    {
      body: t.Object({
        title: t.String(),
        titleEn: t.Optional(t.String()),
        genre: t.Optional(t.String()),
        logline: t.Optional(t.String()),
        totalBudget: t.Optional(t.Number()),
        budgetBreakdown: t.Optional(
          t.Object({
            pre: t.Optional(t.Number()),
            main: t.Optional(t.Number()),
            post: t.Optional(t.Number()),
            marketing: t.Optional(t.Number()),
            contingency: t.Optional(t.Number()),
          })
        ),
        targetReleaseDate: t.Optional(t.String()),
        scriptId: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params, body, error }) => {
      try {
        const proj = await repo.update(params.id, body as any);
        return { project: proj };
      } catch {
        return error(404, { message: "Project not found" });
      }
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        genre: t.Optional(t.String()),
        logline: t.Optional(t.String()),
        totalBudget: t.Optional(t.Number()),
        status: t.Optional(t.String()),
        targetReleaseDate: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    }
  );
