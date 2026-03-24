import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { aiRoutes } from "./ai";
import { db, projects } from "./db";
import { eq } from "drizzle-orm";

const app = new Elysia()
  .use(cors())
  .get("/", () => "Cinematic Engine Backend Alive")
  .use(aiRoutes)
  .group("/api", (app) =>
    app
      .get("/projects", async () => {
        const allProjects = await db.select().from(projects);
        return { projects: allProjects };
      })
      .post("/projects", async ({ body }) => {
        const [newProject] = await db.insert(projects).values(body).returning();
        return { success: true, project: newProject };
      }, {
        body: t.Object({
          title: t.String(),
          category: t.String(),
          genre: t.String()
        })
      })
      .get("/projects/:id", async ({ params: { id } }) => {
        const [project] = await db.select().from(projects).where(eq(projects.id, parseInt(id)));
        return project;
      })
      .patch("/projects/:id", async ({ params: { id }, body }) => {
        const updateData: any = { ...body, updatedAt: new Date() };
        const [updatedProject] = await db.update(projects)
          .set(updateData)
          .where(eq(projects.id, parseInt(id)))
          .returning();
        return { success: true, project: updatedProject };
      })
      .delete("/projects/:id", async ({ params: { id } }) => {
        await db.delete(projects).where(eq(projects.id, parseInt(id)));
        return { success: true };
      })
  )
  .listen(3001);

console.log(`🎬 Cinematic Engine Backend running at ${app.server?.hostname}:${app.server?.port}`);
