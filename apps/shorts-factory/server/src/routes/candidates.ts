import { Elysia, t } from "elysia";
import { db, candidateClips, assets, sources, renderJobs, editTemplates } from "../db";
import { eq, desc } from "drizzle-orm";
import { triggerRender } from "../lib/worker-bridge";

export const candidatesRoutes = new Elysia()

  // GET /api/candidates?assetId=
  .get("/api/candidates", async ({ query }) => {
    const rows = await db
      .select()
      .from(candidateClips)
      .where(query.assetId ? eq(candidateClips.assetId, Number(query.assetId)) : undefined)
      .orderBy(desc(candidateClips.createdAt));
    return { candidates: rows };
  })

  // GET /api/candidates/:id
  .get("/api/candidates/:id", async ({ params, error }) => {
    const [row] = await db
      .select()
      .from(candidateClips)
      .where(eq(candidateClips.id, Number(params.id)));
    if (!row) return error(404, { error: "Candidate not found" });
    return row;
  })

  // POST /api/candidates
  .post(
    "/api/candidates",
    async ({ body, error }) => {
      const [asset] = await db
        .select()
        .from(assets)
        .where(eq(assets.id, body.assetId));
      if (!asset) return error(404, { error: "Asset not found" });
      if (asset.downloadStatus !== "done") {
        return error(400, { error: "Asset must be downloaded before adding candidates" });
      }

      const clipDuration = body.endSec - body.startSec;
      if (clipDuration <= 0) {
        return error(400, { error: "endSec must be greater than startSec" });
      }

      if (asset.sourceId) {
        const [source] = await db.select().from(sources).where(eq(sources.id, asset.sourceId));
        if (source?.maxClipSeconds && clipDuration > source.maxClipSeconds) {
          return error(400, {
            error: `Clip duration ${clipDuration}s exceeds source limit of ${source.maxClipSeconds}s`,
          });
        }
      }

      const [row] = await db
        .insert(candidateClips)
        .values({
          assetId: body.assetId,
          startSec: body.startSec,
          endSec: body.endSec,
          ruleType: body.ruleType,
          rationale: body.rationale ?? null,
          status: "pending",
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        assetId: t.Number(),
        startSec: t.Number(),
        endSec: t.Number(),
        ruleType: t.String(),
        rationale: t.Optional(t.String()),
      }),
    }
  )

  // PATCH /api/candidates/:id
  .patch(
    "/api/candidates/:id",
    async ({ params, body, error }) => {
      const [existing] = await db
        .select()
        .from(candidateClips)
        .where(eq(candidateClips.id, Number(params.id)));
      if (!existing) return error(404, { error: "Candidate not found" });

      await db
        .update(candidateClips)
        .set({
          ...(body.startSec !== undefined && { startSec: body.startSec }),
          ...(body.endSec !== undefined && { endSec: body.endSec }),
          ...(body.ruleType !== undefined && { ruleType: body.ruleType }),
          ...(body.rationale !== undefined && { rationale: body.rationale }),
          ...(body.status !== undefined && { status: body.status }),
        })
        .where(eq(candidateClips.id, existing.id));

      const [updated] = await db
        .select()
        .from(candidateClips)
        .where(eq(candidateClips.id, existing.id));
      return updated;
    },
    {
      body: t.Object({
        startSec: t.Optional(t.Number()),
        endSec: t.Optional(t.Number()),
        ruleType: t.Optional(t.String()),
        rationale: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/candidates/:id
  .delete("/api/candidates/:id", async ({ params, error }) => {
    const [existing] = await db
      .select()
      .from(candidateClips)
      .where(eq(candidateClips.id, Number(params.id)));
    if (!existing) return error(404, { error: "Candidate not found" });

    await db.delete(candidateClips).where(eq(candidateClips.id, existing.id));
    return { success: true };
  })

  // POST /api/candidates/:id/render — create renderJob + spawn worker
  .post("/api/candidates/:id/render", async ({ params, error }) => {
    const [candidate] = await db
      .select()
      .from(candidateClips)
      .where(eq(candidateClips.id, Number(params.id)));
    if (!candidate) return error(404, { error: "Candidate not found" });

    // Get the default template
    const [template] = await db
      .select()
      .from(editTemplates)
      .where(eq(editTemplates.isDefault, 1));
    const templateId = String(template?.id ?? 1);

    const idempotencyKey = `render-${candidate.id}-${templateId}-v1`;

    // Upsert: if already exists, return existing job
    const existing = await db
      .select()
      .from(renderJobs)
      .where(eq(renderJobs.idempotencyKey, idempotencyKey));
    if (existing.length > 0) {
      return { renderJobId: existing[0].id, alreadyExists: true };
    }

    const [job] = await db
      .insert(renderJobs)
      .values({
        candidateClipId: candidate.id,
        templateId,
        langSet: "kr,en",
        status: "queued",
        idempotencyKey,
      })
      .returning();

    // Mark candidate as rendering
    await db
      .update(candidateClips)
      .set({ status: "rendering" })
      .where(eq(candidateClips.id, candidate.id));

    // Spawn Python worker (fire-and-forget)
    triggerRender(job.id).catch(console.error);

    return { renderJobId: job.id, alreadyExists: false };
  });
