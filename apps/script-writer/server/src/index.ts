import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { aiRoutes } from "./ai";
import { db, projects, loglineIdeas, projectOutline, scenes, cuts, productionAssets } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { syncProjectToFileSystem } from "./lib/sync";
import { addJob, getJob } from "./services/pdfQueue";
import { analyzeScript, analyzeProduction } from "./services/analysisEngine";
import { generateImage, buildCinematicPrompt, generateImageCandidates } from "./services/imageGenerator";
import { generateTTS } from "./services/audioGenerator";
import { getProviderStatus, getProvidersByType, setProviderEnabled } from "./services/providers";
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
        // Enrich with scene/cut aggregate counts for studio compatibility
        const enriched = await Promise.all(allProjects.map(async (p) => {
          const sceneRows = await db.select({
            total: count(),
            done: sql<number>`sum(case when ${scenes.status} = 'done' then 1 else 0 end)`,
          }).from(scenes).where(eq(scenes.projectId, p.id));
          const cutRows = await db.select({
            total: count(),
            done: sql<number>`sum(case when ${cuts.status} = 'done' then 1 else 0 end)`,
          }).from(cuts).where(eq(cuts.projectId, p.id));
          return {
            ...p,
            totalScenes: sceneRows[0]?.total ?? 0,
            completedScenes: sceneRows[0]?.done ?? 0,
            totalCuts: cutRows[0]?.total ?? 0,
            completedCuts: cutRows[0]?.done ?? 0,
          };
        }));
        return { projects: enriched };
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
            // Structured path: public/storyboard/images/{INITIALS}_{id}_{slug}/{id}_S01_C{nn}.jpg
            const initials = projectTitle.split(/\s+/).map((w: string) => w.replace(/[^a-zA-Z]/g, "")[0]).filter(Boolean).join("").toUpperCase() || "PRJ";
            const slug = projectTitle.replace(/[^\x00-\x7F]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `project-${id}`;
            const cn = String(frameNumber ?? "01").padStart(2, "0");
            saveDir = path.join(process.cwd(), "public", "storyboard", "images", `${initials}_${id}_${slug}`);
            fileName = `${id}_S01_C${cn}.jpg`;
          } else {
            saveDir = path.join(process.cwd(), "public", "storyboard", "images");
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
      .get("/open-folder", async ({ query }) => {
        const urlPath = decodeURIComponent((query as any).path || '');
        if (!urlPath) return { success: false, error: 'No path provided' };
        // Strip URL prefix and cache buster, then get directory
        const cleaned = urlPath.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '').replace(/^\/public\//, '');
        const publicRoot = path.resolve(process.cwd(), 'public');
        const absDir = path.resolve(publicRoot, path.dirname(cleaned));
        // Guard against path traversal outside public/
        if (!absDir.startsWith(publicRoot + path.sep) && absDir !== publicRoot) {
          return { success: false, error: 'Invalid path' };
        }
        if (!fs.existsSync(absDir)) return { success: false, error: 'Folder not found', path: absDir };
        await Bun.$`open ${absDir}`;
        return { success: true, path: absDir };
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

      // ─── SCENES ──────────────────────────────────────────────────
      .get("/projects/:id/scenes", async ({ params: { id } }) => {
        const rows = await db.select().from(scenes)
          .where(eq(scenes.projectId, parseInt(id)))
          .orderBy(scenes.sceneNumber);
        // Build sequences (act-based grouping) for studio compatibility
        const actGroups: Record<number, { count: number; done: number }> = {};
        for (const r of rows) {
          const act = r.act ?? 1;
          if (!actGroups[act]) actGroups[act] = { count: 0, done: 0 };
          actGroups[act].count++;
          if (r.status === 'done') actGroups[act].done++;
        }
        const sequences = Object.entries(actGroups).map(([act, g]) => ({
          id: `act-${act}`,
          number: Number(act),
          title: `Act ${act}`,
          projectId: id,
          sceneCount: g.count,
          completedSceneCount: g.done,
        }));
        // Parse characters JSON and attach first cut's image as cover
        const parsed = await Promise.all(rows.map(async (r) => {
          const [firstCut] = await db.select().from(cuts)
            .where(and(eq(cuts.sceneId, r.id), eq(cuts.cutNumber, 1)));
          return {
            ...r,
            characters: JSON.parse(r.characters || '[]'),
            coverImageUrl: firstCut?.imageUrl || firstCut?.thumbnailUrl || null,
          };
        }));
        return { scenes: parsed, sequences, totalCount: rows.length };
      })
      .post("/projects/:id/scenes/parse", async ({ params: { id } }) => {
        const projectId = parseInt(id);
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
        if (!project?.scenario) return { success: false, error: "No screenplay text" };

        // Delete existing scenes/cuts for this project
        const existingScenes = await db.select().from(scenes).where(eq(scenes.projectId, projectId));
        for (const s of existingScenes) {
          await db.delete(cuts).where(eq(cuts.sceneId, s.id));
        }
        await db.delete(scenes).where(eq(scenes.projectId, projectId));

        // Parse screenplay — import dynamically to avoid bundling issues
        const { parseScreenplayToScenes } = await import("../../src/utils/sceneCutParser.js");
        const result = parseScreenplayToScenes(project.scenario, { projectTitle: project.title });

        // Insert scenes and cuts
        for (const s of result.scenes) {
          const act = s.number / result.scenes.length <= 0.25 ? 1 : s.number / result.scenes.length <= 0.75 ? 2 : 3;
          const [inserted] = await db.insert(scenes).values({
            projectId,
            sceneNumber: s.number,
            slug: s.slug,
            displayId: s.displayId,
            heading: s.heading,
            setting: s.setting,
            location: s.location,
            timeOfDay: s.timeOfDay,
            summary: s.summary,
            characters: JSON.stringify(s.characters),
            act,
            cutCount: s.cutCount,
          }).returning();

          for (const c of s.cuts) {
            await db.insert(cuts).values({
              sceneId: inserted.id,
              projectId,
              cutNumber: c.number,
              slug: c.slug,
              displayId: c.displayId,
              type: c.type,
              description: c.description,
              scriptText: c.description,
            });
          }
        }

        return { success: true, stats: result.stats };
      })
      .get("/scenes/:sceneId", async ({ params: { sceneId } }) => {
        const [scene] = await db.select().from(scenes).where(eq(scenes.id, parseInt(sceneId)));
        if (!scene) return null;
        const sceneCuts = await db.select().from(cuts)
          .where(eq(cuts.sceneId, scene.id))
          .orderBy(cuts.cutNumber);
        return { ...scene, characters: JSON.parse(scene.characters || "[]"), cuts: sceneCuts };
      })
      // Slug-based scene lookup for studio (routes use slugs like 'sc001')
      .get("/projects/:id/scenes/by-slug/:slug", async ({ params: { id, slug } }) => {
        const [scene] = await db.select().from(scenes)
          .where(and(eq(scenes.projectId, parseInt(id)), eq(scenes.slug, slug)));
        if (!scene) return null;
        const sceneCuts = await db.select().from(cuts)
          .where(eq(cuts.sceneId, scene.id))
          .orderBy(cuts.cutNumber);
        return { ...scene, characters: JSON.parse(scene.characters || "[]"), cuts: sceneCuts };
      })

      // ─── CUTS ────────────────────────────────────────────────────
      .get("/cuts/:cutId", async ({ params: { cutId } }) => {
        const [cut] = await db.select().from(cuts).where(eq(cuts.id, parseInt(cutId)));
        return cut || null;
      })
      .patch("/cuts/:cutId", async ({ params: { cutId }, body }) => {
        const id = parseInt(cutId);
        const updates: Record<string, any> = {};
        const b = body as any;
        if (b.status !== undefined) updates.status = b.status;
        if (b.scriptText !== undefined) updates.scriptText = b.scriptText;
        if (b.imagePrompt !== undefined) updates.imagePrompt = b.imagePrompt;
        if (b.imageUrl !== undefined) updates.imageUrl = b.imageUrl;
        if (b.videoPrompt !== undefined) updates.videoPrompt = b.videoPrompt;
        if (b.videoUrl !== undefined) updates.videoUrl = b.videoUrl;
        if (b.audioUrl !== undefined) updates.audioUrl = b.audioUrl;
        if (b.thumbnailUrl !== undefined) updates.thumbnailUrl = b.thumbnailUrl;

        await db.update(cuts).set(updates).where(eq(cuts.id, id));
        const [updated] = await db.select().from(cuts).where(eq(cuts.id, id));

        // Update scene completed count
        if (updated && b.status === 'done') {
          const doneCuts = await db.select().from(cuts)
            .where(and(eq(cuts.sceneId, updated.sceneId!), eq(cuts.status, 'done')));
          await db.update(scenes).set({ completedCutCount: doneCuts.length })
            .where(eq(scenes.id, updated.sceneId!));
        }

        return { success: true, cut: updated };
      })

      // ─── PRODUCTION PIPELINE ─────────────────────────────────
      // Get all pipeline node states for a project
      .get("/projects/:id/pipeline", async ({ params: { id } }) => {
        const projectId = parseInt(id);
        const assets = await db.select().from(productionAssets)
          .where(eq(productionAssets.projectId, projectId))
          .orderBy(productionAssets.createdAt);
        // Group by nodeId, return latest per node
        const byNode: Record<string, any> = {};
        for (const a of assets) {
          byNode[a.nodeId] = {
            ...a,
            outputData: a.outputData ? JSON.parse(a.outputData) : null,
            imageUrls: a.imageUrls ? JSON.parse(a.imageUrls) : [],
            inputData: a.inputData ? JSON.parse(a.inputData) : null,
          };
        }
        return { success: true, nodes: byNode };
      })
      // Get a specific node's result
      .get("/projects/:id/pipeline/:nodeId", async ({ params: { id, nodeId } }) => {
        const rows = await db.select().from(productionAssets)
          .where(and(eq(productionAssets.projectId, parseInt(id)), eq(productionAssets.nodeId, nodeId)))
          .orderBy(desc(productionAssets.createdAt));
        if (rows.length === 0) return { success: true, asset: null };
        const a = rows[0];
        return {
          success: true,
          asset: {
            ...a,
            outputData: a.outputData ? JSON.parse(a.outputData) : null,
            imageUrls: a.imageUrls ? JSON.parse(a.imageUrls) : [],
            inputData: a.inputData ? JSON.parse(a.inputData) : null,
          },
          history: rows.map(r => ({ id: r.id, status: r.status, style: r.style, createdAt: r.createdAt })),
        };
      })
      // Execute a pipeline node
      .post("/projects/:id/pipeline/:nodeId/execute", async ({ params: { id, nodeId }, body }) => {
        const projectId = parseInt(id);
        const b = body as any;

        // Create or update asset record
        const existing = await db.select().from(productionAssets)
          .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.nodeId, nodeId)));

        const assetData = {
          projectId,
          nodeId,
          phase: b.phase || 'unknown',
          track: b.track || 'design',
          status: 'generating' as const,
          inputData: b.inputData ? JSON.stringify(b.inputData) : null,
          style: b.style || null,
          provider: b.provider || 'pollinations',
          updatedAt: new Date().toISOString(),
        };

        let assetId: number;
        if (existing.length > 0) {
          await db.update(productionAssets).set(assetData).where(eq(productionAssets.id, existing[0].id));
          assetId = existing[0].id;
        } else {
          const [inserted] = await db.insert(productionAssets).values(assetData).returning();
          assetId = inserted.id;
        }

        // For design nodes with storyboard API: execute immediately
        const STORYBOARD_API = process.env.STORYBOARD_API_URL || 'http://localhost:3007';
        const apiMap: Record<string, string> = {
          character_design: '/api/character',
          set_design: '/api/environment',
          costume_design: '/api/costume',
          props: '/api/props',
          storyboard: '/api/generate',
        };

        const apiEndpoint = apiMap[nodeId];
        if (apiEndpoint) {
          try {
            const res = await fetch(`${STORYBOARD_API}${apiEndpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                description: b.description || b.inputData?.description || '',
                style: b.style || 'bong',
                project: b.project || 'Untitled',
                scene: b.scene || b.description || '',
              }),
            });
            const result = await res.json();
            // Build image URL: prefer explicit url, then construct from path
            let imgUrl = result.url || result.image_url || null;
            if (!imgUrl && result.path) {
              const filename = result.path.split('/').pop();
              imgUrl = `${STORYBOARD_API}/output/${filename}`;
            }
            const imageUrls = imgUrl ? [imgUrl] : (result.images || []);
            await db.update(productionAssets).set({
              status: result.success !== false ? 'done' : 'error',
              outputData: JSON.stringify(result),
              imageUrls: JSON.stringify(imageUrls),
              errorMessage: result.error || null,
              updatedAt: new Date().toISOString(),
            }).where(eq(productionAssets.id, assetId));
            return { success: true, assetId, result: { ...result, imageUrl: imgUrl } };
          } catch (e: any) {
            await db.update(productionAssets).set({
              status: 'error',
              errorMessage: e.message,
              updatedAt: new Date().toISOString(),
            }).where(eq(productionAssets.id, assetId));
            return { success: false, error: e.message };
          }
        }

        // ─── Analysis nodes: run locally ───
        if (nodeId === 'script_analysis' || nodeId === 'production_breakdown') {
          try {
            const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
            if (!project?.scenario) {
              await db.update(productionAssets).set({ status: 'error', errorMessage: 'No screenplay text' }).where(eq(productionAssets.id, assetId));
              return { success: false, error: 'No screenplay text available' };
            }

            if (nodeId === 'script_analysis') {
              const result = await analyzeScript(project.scenario, project.title);
              await db.update(productionAssets).set({
                status: 'done',
                outputData: JSON.stringify(result),
                updatedAt: new Date().toISOString(),
              }).where(eq(productionAssets.id, assetId));
              return { success: true, assetId, result: { characters: result.characters.length, locations: result.locations.length, stats: result.stats } };
            }

            if (nodeId === 'production_breakdown') {
              // Requires script_analysis to have run first
              const [analysisAsset] = await db.select().from(productionAssets)
                .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.nodeId, 'script_analysis'), eq(productionAssets.status, 'done')));
              if (!analysisAsset?.outputData) {
                await db.update(productionAssets).set({ status: 'error', errorMessage: 'Run script_analysis first' }).where(eq(productionAssets.id, assetId));
                return { success: false, error: 'Run script_analysis first' };
              }
              const analysisResult = JSON.parse(analysisAsset.outputData);
              const breakdown = await analyzeProduction(analysisResult);
              await db.update(productionAssets).set({
                status: 'done',
                outputData: JSON.stringify(breakdown),
                updatedAt: new Date().toISOString(),
              }).where(eq(productionAssets.id, assetId));
              return { success: true, assetId, result: { locations: breakdown.uniqueLocations, shootingDays: breakdown.estimatedShootingDays, nightScenes: breakdown.nightScenes } };
            }
          } catch (e: any) {
            await db.update(productionAssets).set({ status: 'error', errorMessage: e.message }).where(eq(productionAssets.id, assetId));
            return { success: false, error: e.message };
          }
        }

        // ─── Video pipeline nodes ───
        if (nodeId === 'image_prompt' || nodeId === 'image_gen' || nodeId === 'audio_gen') {
          try {
            if (nodeId === 'image_prompt') {
              // Generate cinematic prompt from cut description
              const prompt = buildCinematicPrompt({
                description: b.description || '',
                characters: b.characters,
                location: b.location,
                timeOfDay: b.timeOfDay,
                visualTone: b.visualTone,
                cameraAngle: b.cameraAngle,
              });
              await db.update(productionAssets).set({
                status: 'done',
                outputData: JSON.stringify({ prompt }),
                updatedAt: new Date().toISOString(),
              }).where(eq(productionAssets.id, assetId));
              return { success: true, assetId, result: { prompt } };
            }

            if (nodeId === 'image_gen') {
              const prompt = b.prompt || b.description || '';
              const result = await generateImage(prompt);
              const imageUrls = result.imageUrl ? [result.imageUrl] : [];
              await db.update(productionAssets).set({
                status: result.success ? 'done' : 'error',
                outputData: JSON.stringify(result),
                imageUrls: JSON.stringify(imageUrls),
                errorMessage: result.error || null,
                updatedAt: new Date().toISOString(),
              }).where(eq(productionAssets.id, assetId));

              // Also update the cut's image_url if cutId provided
              if (result.success && result.imageUrl && b.cutId) {
                await db.update(cuts).set({ imageUrl: result.imageUrl }).where(eq(cuts.id, parseInt(b.cutId)));
              }

              return { success: result.success, assetId, result };
            }

            if (nodeId === 'audio_gen') {
              const text = b.text || b.description || '';
              const result = await generateTTS(text, { lang: b.lang || 'ko' });
              await db.update(productionAssets).set({
                status: result.success ? 'done' : 'error',
                outputData: JSON.stringify(result),
                errorMessage: result.error || null,
                updatedAt: new Date().toISOString(),
              }).where(eq(productionAssets.id, assetId));

              // Update cut's audio_url if cutId provided
              if (result.success && result.audioUrl && b.cutId) {
                await db.update(cuts).set({ audioUrl: result.audioUrl }).where(eq(cuts.id, parseInt(b.cutId)));
              }

              return { success: result.success, assetId, result };
            }
          } catch (e: any) {
            await db.update(productionAssets).set({ status: 'error', errorMessage: e.message }).where(eq(productionAssets.id, assetId));
            return { success: false, error: e.message };
          }
        }

        // ─── Text-based design nodes (generate structured data from screenplay) ───
        const textNodeHandlers: Record<string, () => Promise<any>> = {
          visual_world: async () => {
            const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
            const scenario = project?.scenario || '';
            // Extract visual tone from screenplay context
            const locations = scenario.match(/(?:INT\.|EXT\.)[^\n]+/g) || [];
            const uniqueLocations = [...new Set(locations.map(l => l.trim()))].slice(0, 10);
            return {
              colorPalette: b.colorPalette || 'Cold blue-gray with warm amber accents, high contrast noir lighting',
              visualTone: b.visualTone || 'Tech-noir thriller: metallic surfaces, screen glow, urban density',
              lightingStyle: 'Low-key with motivated sources, neon accents in night scenes',
              cameraLanguage: 'Handheld intimacy for dialogue, locked-off symmetry for tension',
              referenceLocations: uniqueLocations,
              moodKeywords: ['tension', 'paranoia', 'isolation', 'digital claustrophobia', 'neon noir'],
            };
          },
          character_arc: async () => {
            // Use script_analysis data if available
            const [analysisAsset] = await db.select().from(productionAssets)
              .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.nodeId, 'script_analysis'), eq(productionAssets.status, 'done')));
            const analysis = analysisAsset?.outputData ? JSON.parse(analysisAsset.outputData) : null;
            const chars = analysis?.characters?.filter((c: any) => c.type === 'lead' || c.type === 'supporting') || [];
            return {
              characters: chars.map((c: any) => ({
                name: c.name,
                type: c.type,
                sceneCount: c.sceneCount,
                arc: {
                  act1: `${c.name} 소개 및 일상 (씬 1~${Math.floor(c.sceneCount * 0.25)})`,
                  act2: `${c.name} 갈등 심화 및 변화 (씬 ${Math.floor(c.sceneCount * 0.25)}~${Math.floor(c.sceneCount * 0.75)})`,
                  act3: `${c.name} 최종 결단 및 결말 (씬 ${Math.floor(c.sceneCount * 0.75)}~${c.sceneCount})`,
                },
                motivation: `Driven by internal conflict across ${c.sceneCount} scenes`,
                transformation: 'Character evolution through escalating stakes',
              })),
            };
          },
          set_dressing: async () => {
            const [analysisAsset] = await db.select().from(productionAssets)
              .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.nodeId, 'script_analysis'), eq(productionAssets.status, 'done')));
            const analysis = analysisAsset?.outputData ? JSON.parse(analysisAsset.outputData) : null;
            const locations = analysis?.locations?.slice(0, 8) || [];
            return {
              locations: locations.map((loc: any) => ({
                name: loc.name,
                setting: loc.setting,
                frequency: loc.frequency,
                dressingNotes: `${loc.setting === 'INT.' ? 'Interior' : 'Exterior'} — ${loc.name}: props, furniture, and atmosphere details TBD`,
                atmosphereKeywords: loc.setting === 'INT.' ? ['enclosed', 'artificial light', 'detailed props'] : ['natural light', 'weather', 'wide scope'],
              })),
            };
          },
          shot_list: async () => {
            // Generate shot list from scene/cut data
            const sceneRows = await db.select().from(scenes)
              .where(eq(scenes.projectId, projectId)).orderBy(scenes.sceneNumber).limit(10);
            const shotList = [];
            for (const scene of sceneRows) {
              const cutRows = await db.select().from(cuts)
                .where(eq(cuts.sceneId, scene.id)).orderBy(cuts.cutNumber).limit(5);
              for (const cut of cutRows) {
                shotList.push({
                  scene: scene.displayId || scene.slug,
                  cut: cut.displayId || cut.slug,
                  type: cut.type,
                  description: (cut.description || '').slice(0, 60),
                  cameraAngle: cut.type === 'dialogue' ? 'Medium Close-Up' : 'Wide Shot',
                  lens: cut.type === 'dialogue' ? '85mm' : '24mm',
                  movement: cut.type === 'action' ? 'Tracking' : 'Static',
                  duration: `${cut.duration || 4}s`,
                });
              }
            }
            return { shots: shotList, totalShots: shotList.length };
          },
          art_bible: async () => {
            // Compile all design node results
            const allAssets = await db.select().from(productionAssets)
              .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.track, 'design'), eq(productionAssets.status, 'done')));
            const compiled: Record<string, any> = {};
            for (const asset of allAssets) {
              compiled[asset.nodeId] = {
                status: asset.status,
                data: asset.outputData ? JSON.parse(asset.outputData) : null,
                images: asset.imageUrls ? JSON.parse(asset.imageUrls) : [],
                style: asset.style,
                createdAt: asset.createdAt,
              };
            }
            return { compiledSections: Object.keys(compiled).length, totalSections: 11, sections: compiled };
          },
          image_pick: async () => {
            // Image selection — just marks the selected image
            return { selectedIndex: b.selectedIndex ?? 0, imageUrl: b.imageUrl || null };
          },
          video_prompt: async () => {
            const description = b.description || '';
            const cameraMove = b.cameraMove || 'slow zoom in';
            const prompt = `Cinematic video: ${description}. Camera: ${cameraMove}. Smooth motion, 24fps, film look, shallow DOF.`;
            return { prompt, cameraMove };
          },
          video_gen: async () => {
            // Pollinations also supports video via text-to-video
            const prompt = b.prompt || b.description || '';
            const encodedPrompt = encodeURIComponent(prompt);
            // Pollinations video endpoint (experimental)
            const videoUrl = `https://video.pollinations.ai/generate?prompt=${encodedPrompt}&model=fast-svd`;
            return { videoUrl, provider: 'pollinations-video', note: 'Experimental — may not be available' };
          },
          final_cut: async () => {
            // Assembly — gather all assets for this cut
            const cutId = b.cutId ? parseInt(b.cutId) : null;
            if (!cutId) return { error: 'cutId required' };
            const [cut] = await db.select().from(cuts).where(eq(cuts.id, cutId));
            return {
              cutId,
              displayId: cut?.displayId || cut?.slug,
              imageUrl: cut?.imageUrl || null,
              videoUrl: cut?.videoUrl || null,
              audioUrl: cut?.audioUrl || null,
              status: (cut?.imageUrl && cut?.audioUrl) ? 'ready_for_review' : 'missing_assets',
              approved: false,
            };
          },
        };

        const handler = textNodeHandlers[nodeId];
        if (handler) {
          try {
            const result = await handler();
            await db.update(productionAssets).set({
              status: 'done',
              outputData: JSON.stringify(result),
              updatedAt: new Date().toISOString(),
            }).where(eq(productionAssets.id, assetId));
            return { success: true, assetId, result };
          } catch (e: any) {
            await db.update(productionAssets).set({ status: 'error', errorMessage: e.message, updatedAt: new Date().toISOString() }).where(eq(productionAssets.id, assetId));
            return { success: false, error: e.message };
          }
        }

        // Unknown node — return pending
        return { success: true, assetId, status: 'pending', message: `Node ${nodeId} not recognized` };
      })

      // ─── BATCH EXECUTION: Run pipeline for a scene's cuts ─────
      .post("/projects/:id/scenes/:sceneId/batch-execute", async ({ params: { id, sceneId }, body }) => {
        const projectId = parseInt(id);
        const sid = parseInt(sceneId);
        const b = body as any;
        const steps = b.steps || ['image_prompt', 'image_gen', 'audio_gen']; // default pipeline steps
        const maxCuts = b.maxCuts || 10;

        // Get scene and its cuts
        const [scene] = await db.select().from(scenes).where(eq(scenes.id, sid));
        if (!scene) return { success: false, error: 'Scene not found' };

        const sceneCuts = await db.select().from(cuts)
          .where(eq(cuts.sceneId, sid))
          .orderBy(cuts.cutNumber)
          .limit(maxCuts);

        // Load character design reference for consistency
        const [charDesignAsset] = await db.select().from(productionAssets)
          .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.nodeId, 'character_design'), eq(productionAssets.status, 'done')));
        const charRefImages = charDesignAsset?.imageUrls ? JSON.parse(charDesignAsset.imageUrls) : [];
        const characterRef = charRefImages.length > 0 ? charRefImages[0] : undefined;

        const results: any[] = [];

        for (const cut of sceneCuts) {
          const cutResult: Record<string, any> = { cutId: cut.id, slug: cut.slug, steps: {} };

          for (const step of steps) {
            try {
              let payload: any = {
                phase: step.includes('image') ? 'image_gen' : step.includes('video') ? 'video_gen' : 'audio',
                track: 'video',
                cutId: String(cut.id),
              };

              if (step === 'image_prompt') {
                payload.description = cut.description || cut.scriptText || '';
                payload.location = scene.location || '';
                payload.timeOfDay = scene.timeOfDay || '';
                const chars = scene.characters ? JSON.parse(scene.characters) : [];
                payload.characters = chars;
              } else if (step === 'image_gen') {
                // Build prompt from cut description + character reference
                const prompt = buildCinematicPrompt({
                  description: cut.description || cut.scriptText || '',
                  location: scene.location || '',
                  timeOfDay: scene.timeOfDay || '',
                  characters: scene.characters ? JSON.parse(scene.characters) : [],
                  characterRef,
                });
                payload.prompt = prompt;
              } else if (step === 'audio_gen') {
                payload.text = cut.scriptText || cut.description || '';
                payload.lang = 'ko';
              }

              // Execute the step inline (reuse existing logic)
              if (step === 'image_gen') {
                const imgResult = await generateImage(payload.prompt);
                if (imgResult.success && imgResult.imageUrl) {
                  await db.update(cuts).set({ imageUrl: imgResult.imageUrl }).where(eq(cuts.id, cut.id));
                }
                cutResult.steps[step] = { success: imgResult.success, imageUrl: imgResult.imageUrl };
              } else if (step === 'audio_gen' && cut.type === 'dialogue') {
                const audioResult = await generateTTS(payload.text, { lang: 'ko' });
                if (audioResult.success && audioResult.audioUrl) {
                  await db.update(cuts).set({ audioUrl: audioResult.audioUrl }).where(eq(cuts.id, cut.id));
                }
                cutResult.steps[step] = { success: audioResult.success };
              } else if (step === 'image_prompt') {
                const prompt = buildCinematicPrompt(payload);
                await db.update(cuts).set({ imagePrompt: prompt }).where(eq(cuts.id, cut.id));
                cutResult.steps[step] = { success: true };
              } else {
                cutResult.steps[step] = { success: true, skipped: cut.type !== 'dialogue' && step === 'audio_gen' };
              }
            } catch (e: any) {
              cutResult.steps[step] = { success: false, error: e.message };
            }
          }

          results.push(cutResult);
        }

        // Update scene status
        const doneCutCount = await db.select({ c: count() }).from(cuts)
          .where(and(eq(cuts.sceneId, sid), eq(cuts.status, 'done')));

        return {
          success: true,
          scene: scene.displayId || scene.slug,
          processedCuts: results.length,
          totalCuts: scene.cutCount,
          results,
        };
      })

      // ─── PROVIDER STATUS ─────────────────────────────────────
      .get("/providers", () => {
        return { success: true, providers: getProviderStatus() };
      })
      .post("/providers/:id/toggle", ({ params: { id }, body }) => {
        const b = body as any;
        setProviderEnabled(id, b.enabled ?? true, b.apiKey);
        return { success: true, providers: getProviderStatus() };
      })

      // ─── ART BIBLE PDF EXPORT ─────────────────────────────────
      .get("/projects/:id/art-bible/export", async ({ params: { id }, set }) => {
        const projectId = parseInt(id);
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
        if (!project) { set.status = 404; return { error: 'Project not found' }; }

        // Gather all design track assets
        const assets = await db.select().from(productionAssets)
          .where(and(eq(productionAssets.projectId, projectId), eq(productionAssets.track, 'design'), eq(productionAssets.status, 'done')));

        // Build HTML document
        const sections = assets.map(a => {
          const data = a.outputData ? JSON.parse(a.outputData) : {};
          const images = a.imageUrls ? JSON.parse(a.imageUrls) : [];
          return { nodeId: a.nodeId, phase: a.phase, style: a.style, data, images };
        });

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: 'Helvetica Neue', sans-serif; background: #0a0a0a; color: #eee; padding: 40px; }
  h1 { font-size: 28px; border-bottom: 2px solid #8b5cf6; padding-bottom: 12px; }
  h2 { font-size: 20px; color: #8b5cf6; margin-top: 40px; }
  .section { margin-bottom: 32px; page-break-inside: avoid; }
  .images { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .images img { max-width: 400px; border-radius: 6px; }
  .data { background: #111; padding: 16px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; }
  .meta { font-size: 11px; color: #888; margin-top: 8px; }
</style></head><body>
  <h1>${project.title} — Art Bible</h1>
  <p style="color:#888;">${project.category} · ${project.genre} · Generated ${new Date().toISOString().slice(0,10)}</p>
  ${sections.map(s => `
    <div class="section">
      <h2>${s.nodeId.replace(/_/g, ' ').toUpperCase()}</h2>
      ${s.images.length > 0 ? `<div class="images">${s.images.map(url => `<img src="${url}" />`).join('')}</div>` : ''}
      <div class="data">${JSON.stringify(s.data, null, 2)}</div>
      <div class="meta">Style: ${s.style || '-'} · Phase: ${s.phase}</div>
    </div>
  `).join('')}
</body></html>`;

        try {
          const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
          const page = await browser.newPage();
          await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
          const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
          await browser.close();

          set.headers['Content-Type'] = 'application/pdf';
          set.headers['Content-Disposition'] = `attachment; filename="${project.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_ArtBible.pdf"`;
          return new Response(pdfBuffer);
        } catch (e: any) {
          return { success: false, error: `PDF generation failed: ${e.message}` };
        }
      })
  )
  // ─── Gallery static files (storyboard-maker gallery pages) ───
  .get("/gallery/*", async ({ params, set }) => {
    const requestedPath = (params as any)['*'] || 'index.html';
    const galleryDir = path.resolve(__dirname, '../../../storyboard-maker/gallery');
    const filePath = path.join(galleryDir, requestedPath);

    // Security: prevent path traversal
    if (!filePath.startsWith(galleryDir)) {
      set.status = 403;
      return 'Forbidden';
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.woff2': 'font/woff2',
      };
      set.headers['Content-Type'] = mimeTypes[ext] || 'application/octet-stream';
      return file;
    }

    set.status = 404;
    return 'Gallery file not found';
  })
  .listen({
    port: 3006,
    hostname: "0.0.0.0"
  });

console.log(`🎬 Cinematic Engine Backend running at ${app.server?.hostname}:${app.server?.port}`);
