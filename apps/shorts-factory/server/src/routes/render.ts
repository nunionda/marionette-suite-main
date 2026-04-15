import { Elysia, t } from "elysia";
import { db, renderJobs, candidateClips, assets } from "../db";
import { eq, desc, and } from "drizzle-orm";

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
      .where(query.status ? eq(renderJobs.status, query.status) : undefined)
      .orderBy(desc(renderJobs.createdAt));

    return { jobs: rows };
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
    async ({ params, body, headers, error }) => {
      const secret = process.env.WORKER_SECRET;
      if (secret && headers["x-worker-secret"] !== secret) {
        return error(401, { error: "Unauthorized" });
      }

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
          ...(body.subtitleEntries !== undefined && { subtitleEntries: body.subtitleEntries }),
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
        subtitleEntries: t.Optional(t.Nullable(t.String())),
        retryCount: t.Optional(t.Number()),
      }),
    }
  )

  // GET /api/render/:id/subtitles — fetch parsed subtitle entries for editing
  .get("/api/render/:id/subtitles", async ({ params, error }) => {
    const [job] = await db
      .select({ subtitleEntries: renderJobs.subtitleEntries, status: renderJobs.status })
      .from(renderJobs)
      .where(eq(renderJobs.id, Number(params.id)));

    if (!job) return error(404, { error: "Render job not found" });

    const entries = job.subtitleEntries ? JSON.parse(job.subtitleEntries) : [];
    return { entries, status: job.status };
  })

  // POST /api/render/:id/confirm-subtitles — save edited entries + trigger composite
  .post(
    "/api/render/:id/confirm-subtitles",
    async ({ params, body, error }) => {
      const [job] = await db
        .select()
        .from(renderJobs)
        .where(eq(renderJobs.id, Number(params.id)));

      if (!job) return error(404, { error: "Render job not found" });
      if (job.status !== "subtitle_review") {
        return error(400, { error: `Job is not in subtitle_review status (current: ${job.status})` });
      }

      await db
        .update(renderJobs)
        .set({
          subtitleEntries: JSON.stringify(body.entries),
          status: "subtitle_review_confirmed",
          stage: "subtitle_review_confirmed",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(renderJobs.id, job.id));

      return { ok: true, message: "Subtitles confirmed — composite will start shortly" };
    },
    {
      body: t.Object({
        entries: t.Array(
          t.Object({
            start: t.Number(),
            end: t.Number(),
            text: t.String(),
          })
        ),
      }),
    }
  );
