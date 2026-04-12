import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { aiRoutes } from "./ai";
import { db, projects, loglineIdeas, projectOutline } from "./db";
import { eq, desc } from "drizzle-orm";
import { syncProjectToFileSystem } from "./lib/sync";
import { addJob, getJob } from "./services/pdfQueue";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
const API_BASE = `http://localhost:${process.env.PORT || "3006"}/api`;
const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: "public",
    prefix: "/public",
    alwaysStatic: false
  }))
  .onError(({ code, error, set }) => {
    console.error(`💥 Error [${code}]:`, error);
    return { error: (error as any).message || "Internal Server Error" };
  })
  .get("/", () => "Cinematic Engine Backend Alive")
  .group("/api", (app) =>
    app
      .group("/ai", (app) => app.use(aiRoutes))
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
        const updateData: any = { ...(body as any), updated: new Date().toISOString() };
        // Serialize JSON object fields to strings for SQLite text columns
        if (updateData.storyboardImages != null && typeof updateData.storyboardImages === 'object') {
          updateData.storyboardImages = JSON.stringify(updateData.storyboardImages);
        }
        if (updateData.analysisData != null && typeof updateData.analysisData === 'object') {
          updateData.analysisData = JSON.stringify(updateData.analysisData);
        }
        const [updatedProject] = await db.update(projects)
          .set(updateData)
          .where(eq(projects.id, parseInt(id)))
          .returning();
        
        await syncProjectToFileSystem(updatedProject);
        return { success: true, project: updatedProject };
      })
      .post("/projects/:id/upload-image", async ({ params: { id }, body }) => {
        try {
          const { image, url } = body as any;
          let buffer: Buffer | null = null;

          if (url) {
            console.log(`[BACKEND_PROXY] Attempting download: ${url}`);
            try {
              const res = await fetch(url, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  "Referer": "https://pollinations.ai/",
                  "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
                }
              });
              
              if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                // Validate skip (if it's still 401 JSON)
                if (buffer.length < 500 && buffer.toString().includes("success")) {
                  throw new Error("Received error JSON instead of image via fetch");
                }
              } else {
                throw new Error(`Fetch failed: ${res.status}`);
              }
            } catch (err) {
              console.warn(`[BACKEND_PROXY] Fetch blocked, triggering Puppeteer fallback for: ${url}`);
              const safeUrl = url.length > 1800 ? url.substring(0, 1800) : url;
              console.log(`[BACKEND_PROXY] Attempting download: ${safeUrl.substring(0, 100)}...`);
              
              // [PHASE B.6] Puppeteer Hardware-Accelerated Hybrid Capture
              const browser = await puppeteer.launch({ 
                headless: true,
                args: [
                  '--no-sandbox', 
                  '--disable-setuid-sandbox',
                  '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                ]
              });
              try {
                const page = await browser.newPage();
                await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
                await page.setViewport({ width: 1280, height: 720 });
                
                await page.goto(safeUrl, { waitUntil: 'networkidle2', timeout: 45000 });
                
                // Pollinations often shows a log. Wait for the actual image.
                try {
                  console.log("[BACKEND_PROXY] Polling for result image (Full Automation)...");
                  let attempts = 0;
                  let resultImgSrc: string | null = null;
                  
                  while (attempts < 15) {
                    resultImgSrc = (await page.evaluate(() => {
                      // @ts-ignore
                      const imgs = Array.from(document.querySelectorAll('img'));
                      const validImages = imgs.filter((img: any) => 
                        img.width > 400 && 
                        img.height > 300 && 
                        !img.src.includes('logo') &&
                        !img.src.includes('loading')
                      );
                      if (validImages.length === 0) return null;
                      // @ts-ignore
                      validImages.sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height));
                      // @ts-ignore
                      return validImages[0].src;
                    })) as string | null;

                    if (resultImgSrc) break;
                    await new Promise(r => setTimeout(r, 4000));
                    attempts++;
                  }

                  if (resultImgSrc) {
                    const imgElement = await page.$(`img[src="${resultImgSrc}"]`);
                    if (imgElement) {
                      buffer = await imgElement.screenshot({ type: 'jpeg', quality: 95 }) as Buffer;
                      console.log(`[BACKEND_PROXY] SUCCESS: Captured result image (${Math.round(buffer.length/1024)}KB)`);
                    }
                  }
                } catch (e) {
                  console.warn("[BACKEND_PROXY] img tag not found, taking full page screenshot as fallback");
                  buffer = await page.screenshot({ type: 'jpeg', quality: 90 }) as Buffer;
                }
              } finally {
                await browser.close();
              }
            }
          } else if (image && typeof image === 'string') {
            console.log(`[BACKEND_PROXY] Receiving base64 image data...`);
            // Strip the data:image/jpeg;base64, prefix if present
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            buffer = Buffer.from(base64Data, 'base64');
            console.log(`[BACKEND_PROXY] Base64 conversion successful, size: ${buffer.length} bytes`);
          } else {
            throw new Error("No image or URL provided");
          }
          
          if (!buffer) {
            return { success: false, error: "Failed to capture image via proxy" };
          }

          // Basic validation to ensure it's an image, not a text error (230 bytes was typical for 401 JSON)
          if (buffer.length < 500 && buffer.toString().includes("success")) {
             throw new Error("Received error JSON instead of image from AI");
          }

          const { projectTitle, frameNumber } = body as any;
          let saveDir: string;
          let fileName: string;
          if (projectTitle) {
            // Structured export path: public/export/{INITIALS}_{id}_{slug}/{id}_S01_C{nn}.jpg
            const initials = projectTitle.split(/\s+/).map((w: string) => w.replace(/[^a-zA-Z]/g, "")[0]).filter(Boolean).join("").toUpperCase() || "PRJ";
            const slug = projectTitle.replace(/[^\x00-\x7F]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `project-${id}`;
            const cn = String(frameNumber ?? "01").padStart(2, "0");
            saveDir = path.join(process.cwd(), "public", "export", `${initials}_${id}_${slug}`);
            fileName = `${id}_S01_C${cn}.jpg`;
          } else {
            saveDir = path.join(process.cwd(), "public", "storyboards");
            fileName = `img_${id}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
          }
          if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

          const filePath = path.join(saveDir, fileName);
          fs.writeFileSync(filePath, buffer);

          const host = process.env.BACKEND_URL || "http://localhost:3006";
          const relativePath = path.relative(path.join(process.cwd(), "public"), filePath);
          return { success: true, url: `${host}/public/${relativePath.replace(/\\/g, "/")}` };
        } catch (err: any) {
          console.error("Upload error:", err.message);
          return { success: false, error: err.message };
        }
      })
      .delete("/projects/:id", async ({ params: { id } }) => {
        await db.delete(projects).where(eq(projects.id, parseInt(id)));
        return { success: true };
      })
      .post("/projects/:id/export", async ({ params: { id } }) => {
        const jobId = addJob(id);
        return { success: true, jobId, status: "pending" };
      })
      .get("/export/:jobId", async ({ params: { jobId }, set }) => {
        const job = getJob(jobId);
        if (!job) {
          set.status = 404;
          return { error: "Job not found" };
        }
        return { success: true, job };
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
    port: 3006,
    hostname: "0.0.0.0"
  });

console.log(`🎬 Cinematic Engine Backend running at ${app.server?.hostname}:${app.server?.port}`);
