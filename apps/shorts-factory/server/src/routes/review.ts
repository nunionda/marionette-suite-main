import { Elysia, t } from "elysia";
import { db, renderJobs, candidateClips, assets, sources, reviewDecisions, publishJobs } from "../db";
import { eq, desc } from "drizzle-orm";
import { generateMetadata } from "../services/metadataGen";

// Shared select shape for render job + context
const JOB_SELECT = {
  id: renderJobs.id,
  candidateClipId: renderJobs.candidateClipId,
  templateId: renderJobs.templateId,
  langSet: renderJobs.langSet,
  status: renderJobs.status,
  stage: renderJobs.stage,
  outputFilePath: renderJobs.outputFilePath,
  subtitleFilePath: renderJobs.subtitleFilePath,
  createdAt: renderJobs.createdAt,
  updatedAt: renderJobs.updatedAt,
  // clip
  startSec: candidateClips.startSec,
  endSec: candidateClips.endSec,
  ruleType: candidateClips.ruleType,
  assetId: candidateClips.assetId,
  // asset
  videoId: assets.videoId,
  videoTitle: assets.title,
  rawFilePath: assets.rawFilePath,
  // source
  channelName: sources.channelName,
  creditText: sources.creditText,
};

async function attachReviewInfo(rows: (typeof JOB_SELECT)[]) {
  return Promise.all(
    rows.map(async (row: any) => {
      const [latestDecision] = await db
        .select()
        .from(reviewDecisions)
        .where(eq(reviewDecisions.renderJobId, row.id))
        .orderBy(desc(reviewDecisions.decidedAt))
        .limit(1);

      const [publishJob] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.renderJobId, row.id))
        .orderBy(desc(publishJobs.createdAt))
        .limit(1);

      return {
        ...row,
        latestDecision: latestDecision ?? null,
        publishJob: publishJob ?? null,
      };
    })
  );
}

export const reviewRoutes = new Elysia()

  // GET /api/review — all done render jobs with review + publish info
  .get("/api/review", async () => {
    const rows = await db
      .select(JOB_SELECT)
      .from(renderJobs)
      .leftJoin(candidateClips, eq(renderJobs.candidateClipId, candidateClips.id))
      .leftJoin(assets, eq(candidateClips.assetId, assets.id))
      .leftJoin(sources, eq(assets.sourceId, sources.id))
      .where(eq(renderJobs.status, "done"))
      .orderBy(desc(renderJobs.updatedAt));

    return { jobs: await attachReviewInfo(rows as any) };
  })

  // GET /api/review/:id — detail for one render job
  .get("/api/review/:id", async ({ params, error }) => {
    const rows = await db
      .select(JOB_SELECT)
      .from(renderJobs)
      .leftJoin(candidateClips, eq(renderJobs.candidateClipId, candidateClips.id))
      .leftJoin(assets, eq(candidateClips.assetId, assets.id))
      .leftJoin(sources, eq(assets.sourceId, sources.id))
      .where(eq(renderJobs.id, Number(params.id)));

    if (rows.length === 0) return error(404, { error: "Render job not found" });

    const decisions = await db
      .select()
      .from(reviewDecisions)
      .where(eq(reviewDecisions.renderJobId, Number(params.id)))
      .orderBy(desc(reviewDecisions.decidedAt));

    const [publishJob] = await db
      .select()
      .from(publishJobs)
      .where(eq(publishJobs.renderJobId, Number(params.id)))
      .orderBy(desc(publishJobs.createdAt))
      .limit(1);

    return { ...(rows[0] as any), decisions, publishJob: publishJob ?? null };
  })

  // POST /api/review/:id/generate — generate LLM metadata, upsert publishJob draft
  .post("/api/review/:id/generate", async ({ params, error }) => {
    const rows = await db
      .select(JOB_SELECT)
      .from(renderJobs)
      .leftJoin(candidateClips, eq(renderJobs.candidateClipId, candidateClips.id))
      .leftJoin(assets, eq(candidateClips.assetId, assets.id))
      .leftJoin(sources, eq(assets.sourceId, sources.id))
      .where(eq(renderJobs.id, Number(params.id)));

    if (rows.length === 0) return error(404, { error: "Render job not found" });

    const job = rows[0] as any;

    const metadata = await generateMetadata({
      videoTitle: job.videoTitle ?? "K-POP Highlight",
      ruleType: job.ruleType ?? "highlight",
      creditText: job.creditText ?? "",
      startSec: job.startSec ?? 0,
      endSec: job.endSec ?? 20,
      channelName: job.channelName,
    });

    // Upsert publishJob draft — prefer update over insert to avoid orphans
    const [existing] = await db
      .select()
      .from(publishJobs)
      .where(eq(publishJobs.renderJobId, Number(params.id)))
      .orderBy(desc(publishJobs.createdAt))
      .limit(1);

    const hashtagStr = metadata.hashtags.join(" ");

    if (existing) {
      await db
        .update(publishJobs)
        .set({
          title: metadata.titles[0],
          description: metadata.description,
          hashtags: hashtagStr,
          status: "pending",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(publishJobs.id, existing.id));
    } else {
      await db.insert(publishJobs).values({
        renderJobId: Number(params.id),
        title: metadata.titles[0],
        description: metadata.description,
        hashtags: hashtagStr,
        status: "pending",
        idempotencyKey: `review-${params.id}-draft-${Date.now()}`,
      });
    }

    return { success: true, metadata };
  })

  // PATCH /api/review/:id/metadata — update publishJob fields (operator edits)
  .patch(
    "/api/review/:id/metadata",
    async ({ params, body, error }) => {
      const [existing] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.renderJobId, Number(params.id)))
        .orderBy(desc(publishJobs.createdAt))
        .limit(1);

      if (!existing) return error(404, { error: "No draft metadata found. Generate first." });

      await db
        .update(publishJobs)
        .set({
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(publishJobs.id, existing.id));

      const [updated] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.id, existing.id));
      return updated;
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        hashtags: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/review/:id/decide — submit review decision
  .post(
    "/api/review/:id/decide",
    async ({ params, body, error }) => {
      const [job] = await db
        .select()
        .from(renderJobs)
        .where(eq(renderJobs.id, Number(params.id)));
      if (!job) return error(404, { error: "Render job not found" });

      // Record decision
      await db.insert(reviewDecisions).values({
        renderJobId: Number(params.id),
        decision: body.decision,
        reviewer: "operator",
        checklistResult: body.checklistResult
          ? JSON.stringify(body.checklistResult)
          : null,
        notes: body.notes ?? null,
      });

      // Side effects by decision
      if (body.decision === "approve") {
        // Mark publishJob as approved
        const [pj] = await db
          .select()
          .from(publishJobs)
          .where(eq(publishJobs.renderJobId, Number(params.id)))
          .orderBy(desc(publishJobs.createdAt))
          .limit(1);
        if (pj) {
          await db
            .update(publishJobs)
            .set({ status: "approved", updatedAt: new Date().toISOString() })
            .where(eq(publishJobs.id, pj.id));
        }
      } else if (body.decision === "reject") {
        // Reset candidate clip to pending so it can be re-rendered
        if (job.candidateClipId) {
          await db
            .update(candidateClips)
            .set({ status: "pending" })
            .where(eq(candidateClips.id, job.candidateClipId));
        }
      }

      return { success: true, decision: body.decision };
    },
    {
      body: t.Object({
        decision: t.Union([
          t.Literal("approve"),
          t.Literal("reject"),
          t.Literal("request-edit"),
        ]),
        checklistResult: t.Optional(t.Record(t.String(), t.Boolean())),
        notes: t.Optional(t.String()),
      }),
    }
  );
