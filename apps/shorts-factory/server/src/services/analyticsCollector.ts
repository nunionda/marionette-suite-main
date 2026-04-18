/**
 * analyticsCollector.ts — Poll YouTube Data API v3 for video metrics.
 *
 * Priority:
 *   1. YOUTUBE_API_KEY env var (works for public videos, no OAuth needed)
 *   2. OAuth authenticated client (upload scope covers own videos)
 *
 * Collects: views, likes, comments (per-day snapshot).
 * AVD / retention require youtube.yt-analytics scope — planned for V1.
 */

import { google } from "googleapis";
import { db, dailyMetrics, publishJobs } from "../db";
import { eq, and, isNotNull } from "drizzle-orm";
import { getAuthenticatedClient } from "../lib/youtube-auth";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getYouTubeClient() {
  if (process.env.YOUTUBE_API_KEY) {
    return google.youtube({ version: "v3", auth: process.env.YOUTUBE_API_KEY });
  }
  const authClient = await getAuthenticatedClient();
  if (!authClient) return null;
  return google.youtube({ version: "v3", auth: authClient as any });
}

export async function collectMetricsForJob(publishJobId: number): Promise<void> {
  const [pj] = await db
    .select()
    .from(publishJobs)
    .where(eq(publishJobs.id, publishJobId));

  if (!pj?.uploadId) return; // not yet uploaded — nothing to collect

  const yt = await getYouTubeClient();
  if (!yt) throw new Error("No YouTube API access. Set YOUTUBE_API_KEY or connect OAuth.");

  const res = await yt.videos.list({
    part: ["statistics"],
    id: [pj.uploadId],
  });

  const stats = res.data.items?.[0]?.statistics;
  if (!stats) {
    console.warn(`[analytics] No stats returned for videoId=${pj.uploadId}`);
    return;
  }

  const date = todayISO();
  const metricsData = {
    views:    Number(stats.viewCount    ?? 0),
    likes:    Number(stats.likeCount    ?? 0),
    comments: Number(stats.commentCount ?? 0),
  };

  // Upsert: one row per (publishJobId, date)
  const [existing] = await db
    .select()
    .from(dailyMetrics)
    .where(and(eq(dailyMetrics.publishJobId, publishJobId), eq(dailyMetrics.date, date)));

  if (existing) {
    await db
      .update(dailyMetrics)
      .set(metricsData)
      .where(eq(dailyMetrics.id, existing.id));
  } else {
    await db
      .insert(dailyMetrics)
      .values({ publishJobId, date, ...metricsData });
  }

  console.log(`[analytics] publishJob=${publishJobId} | date=${date} | views=${metricsData.views}`);
}

export async function collectAllMetrics(): Promise<{ collected: number; errors: number }> {
  const uploaded = await db
    .select()
    .from(publishJobs)
    .where(isNotNull(publishJobs.uploadId));

  let collected = 0, errors = 0;
  for (const pj of uploaded) {
    try {
      await collectMetricsForJob(pj.id);
      collected++;
    } catch (err) {
      errors++;
      console.error(`[analytics] Failed for publishJob ${pj.id}:`, err);
    }
  }
  return { collected, errors };
}
