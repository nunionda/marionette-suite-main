/**
 * RSS-based YouTube channel detector.
 * Polls YouTube's public Atom feed (no API key needed) and upserts new videos into assets.
 *
 * Feed URL: https://www.youtube.com/feeds/videos.xml?channel_id={channelId}
 * Returns the 15 most recent uploads. Typical latency: <15 min after publish.
 */

import { db, sources, assets } from "../db";
import { eq, and } from "drizzle-orm";

const RSS_BASE = "https://www.youtube.com/feeds/videos.xml?channel_id=";
const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

interface RssEntry {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
}

function extractTag(block: string, tag: string): string | null {
  // Handles both plain text and CDATA-wrapped values: <title><![CDATA[...]]></title>
  const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
  return m ? m[1].trim() : null;
}

function extractAttr(block: string, tag: string, attr: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`));
  return m ? m[1].trim() : null;
}

/** Parse YouTube Atom feed XML, return list of video entries. */
function parseRssXml(xml: string): RssEntry[] {
  const entries: RssEntry[] = [];

  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const block = m[1];

    const videoId = extractTag(block, "yt:videoId");
    const title = extractTag(block, "title");
    const publishedAt = extractTag(block, "published");
    const thumbnailUrl = extractAttr(block, "media:thumbnail", "url");

    if (!videoId || !title) continue;

    entries.push({
      videoId,
      title,
      publishedAt: publishedAt ?? new Date().toISOString(),
      thumbnailUrl: thumbnailUrl ?? "",
    });
  }

  return entries;
}

/** Poll one source channel. Returns number of new assets inserted. */
export async function detectSource(sourceId: number): Promise<number> {
  const [source] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.id, sourceId), eq(sources.enabled, 1)));

  if (!source) return 0;

  const url = `${RSS_BASE}${source.channelId}`;
  let xml: string;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.error(`[detector] fetch failed for ${source.channelName}:`, err);
    return 0;
  }

  const entries = parseRssXml(xml);
  let newCount = 0;

  for (const entry of entries) {
    try {
      const result = await db
        .insert(assets)
        .values({
          sourceId: source.id,
          videoId: entry.videoId,
          title: entry.title,
          publishedAt: entry.publishedAt,
          thumbnailUrl: entry.thumbnailUrl,
          downloadStatus: "pending",
        })
        .onConflictDoNothing();
      if ((result as any).changes > 0) newCount++;
    } catch {
      // videoId already exists — skip
    }
  }

  // Update lastCheckedAt
  await db
    .update(sources)
    .set({ lastCheckedAt: new Date().toISOString() })
    .where(eq(sources.id, source.id));

  if (newCount > 0) {
    console.log(`[detector] ${source.channelName}: +${newCount} new videos`);
  }
  return newCount;
}

/** Poll all enabled sources. */
export async function detectAll(): Promise<void> {
  const allSources = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.enabled, 1));

  await Promise.all(allSources.map((s) => detectSource(s.id)));
}

let _timer: ReturnType<typeof setInterval> | null = null;

/** Start background polling loop. Safe to call multiple times — only one loop runs. */
export function startDetectorLoop(): void {
  if (_timer) return;
  console.log("[detector] starting RSS poll loop (15 min interval)");
  detectAll().catch(console.error);
  _timer = setInterval(() => detectAll().catch(console.error), POLL_INTERVAL_MS);
}

export function stopDetectorLoop(): void {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
}
