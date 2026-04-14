/**
 * youtubeUploader.ts — Upload a rendered Short to YouTube Data API v3.
 *
 * Status transitions: approved → uploading → published | error
 * Supports scheduled publish: if scheduledAt is a future timestamp,
 * uploads as private with publishAt set (YouTube auto-publishes at that time).
 */

import { google } from "googleapis";
import { createReadStream } from "fs";
import { db, publishJobs, renderJobs } from "../db";
import { eq } from "drizzle-orm";
import { getAuthenticatedClient } from "../lib/youtube-auth";

function now() {
  return new Date().toISOString();
}

function buildDescription(pj: typeof publishJobs.$inferSelect): string {
  const parts: string[] = [];
  if (pj.description) parts.push(pj.description);
  if (pj.hashtags) parts.push("\n" + pj.hashtags);
  return parts.join("\n").slice(0, 5000); // YouTube API limit
}

export async function uploadShort(publishJobId: number): Promise<{ videoId: string }> {
  // ── 1. Load records ──────────────────────────────────────────────────────
  const [pj] = await db
    .select()
    .from(publishJobs)
    .where(eq(publishJobs.id, publishJobId));
  if (!pj) throw new Error(`publishJob ${publishJobId} not found`);

  const [rj] = await db
    .select()
    .from(renderJobs)
    .where(eq(renderJobs.id, pj.renderJobId!));
  if (!rj?.outputFilePath) throw new Error("Render output file not found");

  // ── 2. Mark as uploading ─────────────────────────────────────────────────
  await db
    .update(publishJobs)
    .set({ status: "uploading", updatedAt: now() })
    .where(eq(publishJobs.id, publishJobId));

  try {
    // ── 3. Get authenticated YouTube client ───────────────────────────────
    const authClient = await getAuthenticatedClient();
    if (!authClient) throw new Error("Not authenticated with YouTube");

    const youtube = google.youtube({ version: "v3", auth: authClient as any });

    // ── 4. Parse tags from hashtag string ────────────────────────────────
    const tags = (pj.hashtags ?? "")
      .split(/\s+/)
      .filter((t) => t.startsWith("#"))
      .map((t) => t.slice(1))
      .slice(0, 30); // YouTube limit

    // ── 5. Determine privacy status ───────────────────────────────────────
    const isFutureSchedule =
      !!pj.scheduledAt && new Date(pj.scheduledAt) > new Date();
    const privacyStatus = isFutureSchedule ? "private" : "public";

    // ── 6. Upload ─────────────────────────────────────────────────────────
    console.log(`[uploader] Uploading publishJob=${publishJobId} → ${rj.outputFilePath}`);
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: pj.title.slice(0, 100),
          description: buildDescription(pj),
          tags,
          categoryId: "10", // Music
          defaultLanguage: "en",
        },
        status: {
          privacyStatus,
          ...(isFutureSchedule && {
            publishAt: new Date(pj.scheduledAt!).toISOString(),
          }),
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: "video/mp4",
        body: createReadStream(rj.outputFilePath) as any,
      },
    });

    const videoId = res.data.id!;

    // ── 7. Update publishJob ──────────────────────────────────────────────
    const finalStatus = isFutureSchedule ? "scheduled" : "published";
    await db
      .update(publishJobs)
      .set({ status: finalStatus, uploadId: videoId, updatedAt: now() })
      .where(eq(publishJobs.id, publishJobId));

    console.log(`[uploader] Done — youtube.com/shorts/${videoId}`);
    return { videoId };
  } catch (err: any) {
    // Store error and reset status so operator can retry
    await db
      .update(publishJobs)
      .set({
        status: "error",
        errorMessage: err.message ?? String(err),
        updatedAt: now(),
      })
      .where(eq(publishJobs.id, publishJobId));
    throw err;
  }
}
