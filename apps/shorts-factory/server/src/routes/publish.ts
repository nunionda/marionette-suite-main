/**
 * publish.ts — Publish queue routes + YouTube OAuth flow.
 *
 * Auth endpoints:
 *   GET  /api/auth/youtube/status    — are we connected?
 *   GET  /api/auth/youtube/url       — get consent-screen URL
 *   GET  /api/auth/youtube/callback  — exchange OAuth code (browser redirect)
 *   DELETE /api/auth/youtube         — revoke / clear stored tokens
 *
 * Publish job endpoints:
 *   GET   /api/publish               — list publish jobs with context
 *   GET   /api/publish/:id           — single job detail
 *   PATCH /api/publish/:id           — update title / description / scheduledAt
 *   POST  /api/publish/:id/upload    — trigger upload (background, poll for status)
 */

import { Elysia, t } from "elysia";
import { db, publishJobs, renderJobs, candidateClips, assets, sources } from "../db";
import { eq, desc } from "drizzle-orm";
import { getAuthUrl, exchangeCode, isAuthenticated, revokeAuth } from "../lib/youtube-auth";
import { uploadShort } from "../services/youtubeUploader";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5178";

// Shared select: publishJob + joined context for the UI
const PUBLISH_SELECT = {
  id: publishJobs.id,
  renderJobId: publishJobs.renderJobId,
  platform: publishJobs.platform,
  title: publishJobs.title,
  description: publishJobs.description,
  hashtags: publishJobs.hashtags,
  scheduledAt: publishJobs.scheduledAt,
  status: publishJobs.status,
  uploadId: publishJobs.uploadId,
  errorCode: publishJobs.errorCode,
  errorMessage: publishJobs.errorMessage,
  retryCount: publishJobs.retryCount,
  createdAt: publishJobs.createdAt,
  updatedAt: publishJobs.updatedAt,
  // Context from joined tables
  outputFilePath: renderJobs.outputFilePath,
  videoTitle: assets.title,
  channelName: sources.channelName,
};

function joinedPublishQuery() {
  return db
    .select(PUBLISH_SELECT)
    .from(publishJobs)
    .leftJoin(renderJobs, eq(publishJobs.renderJobId, renderJobs.id))
    .leftJoin(candidateClips, eq(renderJobs.candidateClipId, candidateClips.id))
    .leftJoin(assets, eq(candidateClips.assetId, assets.id))
    .leftJoin(sources, eq(assets.sourceId, sources.id));
}

export const publishRoutes = new Elysia()

  // ── YouTube OAuth ────────────────────────────────────────────────────────

  .get("/api/auth/youtube/status", async () => {
    const authenticated = await isAuthenticated();
    const hasCredentials = !!(
      process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET
    );
    return { authenticated, hasCredentials };
  })

  .get("/api/auth/youtube/url", () => {
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
      return {
        error:
          "Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env first.",
      };
    }
    return { url: getAuthUrl() };
  })

  // Google redirects here after user consents
  .get("/api/auth/youtube/callback", async ({ query, set }) => {
    if (query.error) {
      set.redirect = `${FRONTEND_URL}/?youtubeAuth=error&msg=${encodeURIComponent(
        String(query.error)
      )}`;
      return;
    }
    const code = String(query.code ?? "");
    if (!code || code.length < 10 || code.length > 1024 || !/^[\w\-./]+$/.test(code)) {
      set.redirect = `${FRONTEND_URL}/?youtubeAuth=error&msg=invalid_code`;
      return;
    }
    try {
      await exchangeCode(code);
      set.redirect = `${FRONTEND_URL}/?youtubeAuth=success`;
    } catch (err: any) {
      set.redirect = `${FRONTEND_URL}/?youtubeAuth=error&msg=${encodeURIComponent(
        err.message ?? "unknown_error"
      )}`;
    }
  })

  .delete("/api/auth/youtube", async () => {
    await revokeAuth();
    return { success: true };
  })

  // ── Publish Jobs ─────────────────────────────────────────────────────────

  .get("/api/publish", async ({ query }) => {
    const rows = await joinedPublishQuery().orderBy(desc(publishJobs.updatedAt));
    const filtered = query.status
      ? rows.filter((r) => r.status === query.status)
      : rows;
    return { jobs: filtered };
  })

  .get("/api/publish/:id", async ({ params, error }) => {
    const rows = await joinedPublishQuery()
      .where(eq(publishJobs.id, Number(params.id)));
    if (rows.length === 0) return error(404, { error: "Publish job not found" });
    return rows[0];
  })

  .patch(
    "/api/publish/:id",
    async ({ params, body, error }) => {
      const [pj] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.id, Number(params.id)));
      if (!pj) return error(404, { error: "Publish job not found" });

      await db
        .update(publishJobs)
        .set({
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
          ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt }),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(publishJobs.id, pj.id));

      const [updated] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.id, pj.id));
      return updated;
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        hashtags: t.Optional(t.String()),
        scheduledAt: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // Trigger upload — fires in background, caller polls for status
  .post("/api/publish/:id/upload", async ({ params, error }) => {
    const [pj] = await db
      .select()
      .from(publishJobs)
      .where(eq(publishJobs.id, Number(params.id)));
    if (!pj) return error(404, { error: "Publish job not found" });

    const uploadable = ["approved", "error"];
    if (!uploadable.includes(pj.status ?? "")) {
      return error(409, {
        error: `Cannot upload a job with status '${pj.status}'`,
      });
    }

    const id = Number(params.id);
    // Fire-and-forget — UI polls publishJob.status for completion
    (async () => {
      try {
        await uploadShort(id);
      } catch (err) {
        console.error("[publish] upload error:", err);
      }
    })();

    return { success: true, message: "Upload started" };
  });
