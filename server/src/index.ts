import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { aiRoutes } from "./ai";
import { db, projects, loglineIdeas, projectOutline } from "./db";
import { eq, desc } from "drizzle-orm";
import { syncProjectToFileSystem } from "./lib/sync";

const API_BASE = "http://localhost:3005/api";
const app = new Elysia()
  .use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 5
  }))
  .onError(({ code, error, set }) => {
    console.error(`💥 Error [${code}]:`, error);
    return { error: (error as any).message || "Internal Server Error" };
  })
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
        await syncProjectToFileSystem(newProject);
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
        const updateData: any = { ...(body as any), updatedAt: new Date() };
        const [updatedProject] = await db.update(projects)
          .set(updateData)
          .where(eq(projects.id, parseInt(id)))
          .returning();
        
        await syncProjectToFileSystem(updatedProject);
        return { success: true, project: updatedProject };
      })
      .delete("/projects/:id", async ({ params: { id } }) => {
        await db.delete(projects).where(eq(projects.id, parseInt(id)));
        return { success: true };
      })
      .get("/projects/:id/outline", async ({ params: { id } }) => {
        const outline = await db.select().from(projectOutline)
          .where(eq(projectOutline.projectId, parseInt(id)))
          .orderBy(projectOutline.sceneNumber);
        return { success: true, outline };
      })
      .post("/projects/:id/outline", async ({ params: { id }, body }) => {
        const projectId = parseInt(id);
        const scenes = body.scenes;
        
        // Simple strategy: Clear and re-insert for batch updates
        await db.delete(projectOutline).where(eq(projectOutline.projectId, projectId));
        
        if (scenes && scenes.length > 0) {
          const insertData = scenes.map((s: any) => ({
            projectId,
            act: s.act,
            sceneNumber: s.sceneNumber,
            title: s.title,
            description: s.description,
            status: s.status || 'Planned'
          }));
          await db.insert(projectOutline).values(insertData);
        }
        
        // Trigger FS Sync
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
        const outline = await db.select().from(projectOutline).where(eq(projectOutline.projectId, projectId));
        await syncProjectToFileSystem({ ...project, outline });

        return { success: true };
      }, {
        body: t.Object({
          scenes: t.Array(t.Object({
            act: t.Optional(t.Number()),
            sceneNumber: t.Number(),
            title: t.Optional(t.String()),
            description: t.String(),
            status: t.Optional(t.String())
          }))
        })
      })
      .get("/loglines", async () => {
        const allIdeas = await db.select().from(loglineIdeas).orderBy(desc(loglineIdeas.createdAt));
        return { loglines: allIdeas };
      })
      .post("/loglines", async ({ body }) => {
        const [newIdea] = await db.insert(loglineIdeas).values(body).returning();
        return { success: true, logline: newIdea };
      }, {
        body: t.Object({
          content: t.String(),
          genre: t.Optional(t.String()),
          category: t.Optional(t.String())
        })
      })
      .delete("/loglines/:id", async ({ params: { id } }) => {
        await db.delete(loglineIdeas).where(eq(loglineIdeas.id, parseInt(id)));
        return { success: true };
      })
  )
  .listen({
    port: 3005,
    hostname: "0.0.0.0"
  });

console.log(`🎬 Cinematic Engine Backend running at ${app.server?.hostname}:${app.server?.port}`);
