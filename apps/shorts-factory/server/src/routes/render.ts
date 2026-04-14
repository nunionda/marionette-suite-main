import { Elysia, t } from "elysia";
import { db, renderJobs, candidateClips, assets } from "../db";
import { eq, desc } from "drizzle-orm";

export const renderRoutes = new Elysia()

  // GET /api/render — list render jobs with asset info
  .get("/api/render", async ({ query }) => {
    const rows = await db
      .select({
        id: renderJobs.id,
        candidateClipId: renderJobs.candidateClipId,
        templateId: renderJobs.templateId,
        langSet: renderJobs.langSet,
        status: renderJobs.status,
        stage: renderJobs.stage,
        errorCode: renderJobs.errorCode,
        errorMessage: renderJobs.errorMessage,
        outputFilePath: renderJobs.outputFilePath,
        subtitleFilePath: renderJobs.subtitleFilePath,
        idempotencyKey: renderJobs.idempotencyKey,
        retryCount: renderJobs.retryCount,
        createdAt: renderJobs.createdAt,
        updatedAt: renderJobs.updatedAt,
        // Candidate info
        startSec: candidateClips.startSec,
        endSec: candidateClips.endSec,
        ruleType: candidateClips.ruleType,
        assetId: candidateClips.assetId,
        // Asset info
        videoId: assets.videoId,
        videoTitle: assets.title,
        rawFilePath: assets.rawFilePath,
      })
      .from(renderJobs)
      .leftJoin(candidateClips, eq(renderJobs.candidateClipId, candidateClips.id))
      .leftJoin(assets, eq(candidateClips.assetId, assets.id))
      .orderBy(desc(renderJobs.createdAt));

    const filtered = query.status
      ? rows.filter((r) => r.status === query.status)
      : rows;

    return { jobs: filtered };
  })

  // GET /api/render/:id
  .get("/api/render/:id", async ({ params, error }) => {
    const rows = await db
      .select({
        id: renderJobs.id,
        candidateClipId: renderJobs.candidateClipId,
        templateId: renderJobs.templateId,
        langSet: renderJobs.langSet,
        status: renderJobs.status,
        stage: renderJobs.stage,
        errorCode: renderJobs.errorCode,
        errorMessage: renderJobs.errorMessage,
        outputFilePath: renderJobs.outputFilePath,
        subtitleFilePath: renderJobs.subtitleFilePath,
        retryCount: renderJobs.retryCount,
        createdAt: renderJobs.createdAt,
        updatedAt: renderJobs.updatedAt,
        startSec: candidateClips.startSec,
        endSec: candidateClips.endSec,
        ruleType: candidateClips.ruleType,
        assetId: candidateClips.assetId,
        videoId: assets.videoId,
        videoTitle: assets.title,
        rawFilePath: assets.rawFilePath,
      })
      .from(renderJobs)
      .leftJoin(candidateClips, eq(renderJobs.candidateClipId, candidateClips.id))
      .leftJoin(assets, eq(candidateClips.assetId, assets.id))
      .where(eq(renderJobs.id, Number(params.id)));

    if (rows.length === 0) return error(404, { error: "Render job not found" });
    return rows[0];
  })

  // PATCH /api/render/:id — called by Python worker to update status
  .patch(
    "/api/render/:id",
    async ({ params, body, error }) => {
      const [job] = await db
        .select()
        .from(renderJobs)
        .where(eq(renderJobs.id, Number(params.id)));
      if (!job) return error(404, { error: "Render job not found" });

      await db
        .update(renderJobs)
        .set({
          ...(body.status !== undefined && { status: body.status }),
          ...(body.stage !== undefined && { stage: body.stage }),
          ...(body.errorCode !== undefined && { errorCode: body.errorCode }),
          ...(body.errorMessage !== undefined && { errorMessage: body.errorMessage }),
          ...(body.outputFilePath !== undefined && { outputFilePath: body.outputFilePath }),
          ...(body.subtitleFilePath !== undefined && { subtitleFilePath: body.subtitleFilePath }),
          ...(body.retryCount !== undefined && { retryCount: body.retryCount }),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(renderJobs.id, job.id));

      // If done, mark candidate as rendered
      if (body.status === "done" && job.candidateClipId) {
        await db
          .update(candidateClips)
          .set({ status: "rendered" })
          .where(eq(candidateClips.id, job.candidateClipId));
      }
      // If error, reset candidate to pending
      if (body.status === "error" && job.candidateClipId) {
        await db
          .update(candidateClips)
          .set({ status: "pending" })
          .where(eq(candidateClips.id, job.candidateClipId));
      }

      const [updated] = await db
        .select()
        .from(renderJobs)
        .where(eq(renderJobs.id, job.id));
      return updated;
    },
    {
      body: t.Object({
        status: t.Optional(t.String()),
        stage: t.Optional(t.String()),
        errorCode: t.Optional(t.Nullable(t.String())),
        errorMessage: t.Optional(t.Nullable(t.String())),
        outputFilePath: t.Optional(t.Nullable(t.String())),
        subtitleFilePath: t.Optional(t.Nullable(t.String())),
        retryCount: t.Optional(t.Number()),
      }),
    }
  );
