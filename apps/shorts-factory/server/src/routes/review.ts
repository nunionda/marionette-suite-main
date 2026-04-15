import { Elysia, t } from "elysia";
import { db, renderJobs, candidateClips, assets, sources, reviewDecisions, publishJobs } from "../db";
import { eq, desc, inArray } from "drizzle-orm";
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

async function attachReviewInfo(rows: any[]) {
  if (rows.length === 0) return [];

  const jobIds = rows.map(r => r.id as number);

  // Two queries total instead of 2×N — fetch all related rows in bulk
  const [allDecisions, allPublishJobs] = await Promise.all([
    db
      .select()
      .from(reviewDecisions)
      .where(inArray(reviewDecisions.renderJobId, jobIds))
      .orderBy(desc(reviewDecisions.decidedAt)),
    db
      .select()
      .from(publishJobs)
      .where(inArray(publishJobs.renderJobId, jobIds))
      .orderBy(desc(publishJobs.createdAt)),
  ]);

  // Group by renderJobId — first entry is the latest due to DESC order above
  const decisionByJob = new Map<number, typeof allDecisions[0]>();
  for (const d of allDecisions) {
    if (d.renderJobId !== null && !decisionByJob.has(d.renderJobId)) {
      decisionByJob.set(d.renderJobId, d);
    }
  }

  const publishJobByJob = new Map<number, typeof allPublishJobs[0]>();
  for (const pj of allPublishJobs) {
    if (pj.renderJobId !== null && !publishJobByJob.has(pj.renderJobId)) {
      publishJobByJob.set(pj.renderJobId, pj);
    }
  }

  return rows.map(row => ({
    ...row,
    latestDecision: decisionByJob.get(row.id) ?? null,
    publishJob: publishJobByJob.get(row.id) ?? null,
  }));
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

    const variantsJson = JSON.stringify(metadata.titles);

    if (existing) {
      await db
        .update(publishJobs)
        .set({
          title: metadata.titles[0],
          description: metadata.description,
          hashtags: hashtagStr,
          titleVariants: variantsJson,
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
        titleVariants: variantsJson,
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

      // If titleIndex is provided, pick that variant as the active title
      let resolvedTitle = body.title;
      if (body.titleIndex !== undefined && existing.titleVariants) {
        try {
          const variants = JSON.parse(existing.titleVariants) as string[];
          if (variants[body.titleIndex]) resolvedTitle = variants[body.titleIndex];
        } catch {
          // malformed JSON — fall through to body.title
        }
      }

      await db
        .update(publishJobs)
        .set({
          ...(resolvedTitle !== undefined && { title: resolvedTitle }),
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
        titleIndex: t.Optional(t.Number()),
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
        // Require metadata draft before approving
        const [pj] = await db
          .select()
          .from(publishJobs)
          .where(eq(publishJobs.renderJobId, Number(params.id)))
          .orderBy(desc(publishJobs.createdAt))
          .limit(1);
        if (!pj) {
          return error(400, { error: "Generate metadata first before approving" });
        }
        await db
          .update(publishJobs)
          .set({ status: "approved", updatedAt: new Date().toISOString() })
          .where(eq(publishJobs.id, pj.id));
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
