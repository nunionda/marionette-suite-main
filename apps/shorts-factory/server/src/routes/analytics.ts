/**
 * analytics.ts — Analytics query and manual collection endpoints.
 *
 *   GET  /api/analytics/summary                  — aggregate totals
 *   GET  /api/analytics/videos                   — per-video latest metrics
 *   GET  /api/analytics/timeseries/:publishJobId — daily series for one video
 *   POST /api/analytics/collect                  — collect all uploaded videos
 *   POST /api/analytics/collect/:publishJobId    — collect one video
 */

import { Elysia } from "elysia";
import { db, dailyMetrics, publishJobs } from "../db";
import { eq, desc } from "drizzle-orm";
import { collectAllMetrics, collectMetricsForJob } from "../services/analyticsCollector";

export const analyticsRoutes = new Elysia()

  // ── Aggregate summary ────────────────────────────────────────────────────

  .get("/api/analytics/summary", async () => {
    const jobs    = await db.select().from(publishJobs);
    const metrics = await db.select().from(dailyMetrics);

    const totalViews    = metrics.reduce((s, m) => s + (m.views    ?? 0), 0);
    const totalLikes    = metrics.reduce((s, m) => s + (m.likes    ?? 0), 0);
    const totalComments = metrics.reduce((s, m) => s + (m.comments ?? 0), 0);

    return {
      totalVideos:   jobs.filter(j => !!j.uploadId).length,
      publishedJobs: jobs.filter(j => j.status === "published").length,
      scheduledJobs: jobs.filter(j => j.status === "scheduled").length,
      totalViews,
      totalLikes,
      totalComments,
    };
  })

  // ── Per-video latest-day metrics ─────────────────────────────────────────

  .get("/api/analytics/videos", async () => {
    const rows = await db
      .select()
      .from(publishJobs)
      .orderBy(desc(publishJobs.updatedAt));

    const allMetrics = await db.select().from(dailyMetrics);

    // Group metrics by publishJobId, then pick the latest date per job
    const byJob: Record<number, typeof allMetrics> = {};
    for (const m of allMetrics) {
      const id = m.publishJobId!;
      if (!byJob[id]) byJob[id] = [];
      byJob[id].push(m);
    }

    const videos = rows.map(pj => {
      const jobMetrics = (byJob[pj.id] ?? [])
        .sort((a, b) => b.date.localeCompare(a.date));
      const latest = jobMetrics[0];
      return {
        id:          pj.id,
        title:       pj.title,
        status:      pj.status,
        uploadId:    pj.uploadId,
        scheduledAt: pj.scheduledAt,
        updatedAt:   pj.updatedAt,
        youtubeUrl:  pj.uploadId ? `https://youtube.com/shorts/${pj.uploadId}` : null,
        views:       latest?.views    ?? 0,
        likes:       latest?.likes    ?? 0,
        comments:    latest?.comments ?? 0,
        lastCollected: latest?.date   ?? null,
      };
    });

    return { videos };
  })

  // ── Time series for a single video ───────────────────────────────────────

  .get("/api/analytics/timeseries/:publishJobId", async ({ params }) => {
    const series = await db
      .select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.publishJobId, Number(params.publishJobId)))
      .orderBy(dailyMetrics.date);

    return { series };
  })

  // ── Trigger collection ───────────────────────────────────────────────────

  .post("/api/analytics/collect", async () => {
    const result = await collectAllMetrics();
    return { success: true, ...result };
  })

  .post("/api/analytics/collect/:publishJobId", async ({ params, error }) => {
    try {
      await collectMetricsForJob(Number(params.publishJobId));
      return { success: true };
    } catch (err: any) {
      return error(500, { error: err.message ?? String(err) });
    }
  });
