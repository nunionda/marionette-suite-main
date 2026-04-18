import { NextResponse } from "next/server";
import { mockEntries } from "../../../../lib/library/mock-entries";
import { readPromoted } from "../../../../lib/library/promoted-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const promoted = await readPromoted();
  const promotedIds = new Set(promoted.map((e) => e.projectId));
  const allEntries = [
    ...mockEntries.filter((e) => !promotedIds.has(e.projectId)),
    ...promoted,
  ];
  const entry = allEntries.find((e) => e.projectId === pid);

  // Charter #69 step derivations: streaming release lifecycle
  const hasStreaming = !!entry?.streaming && entry.streaming.platforms.length > 0;
  const anyLive = !!entry?.streaming?.platforms.some((p) => p.status === "live");
  const allScheduledOrBeyond = hasStreaming &&
    entry!.streaming!.platforms.every((p) => p.status !== "withdrawn");

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: {
      publish: !!entry,
      streamingScheduled: hasStreaming && allScheduledOrBeyond,
      streamingLive: anyLive,
    },
    entry: entry
      ? {
          id: entry.id,
          title: entry.title,
          channels: entry.channels,
          deliverables: entry.deliverables,
          releaseDate: entry.releaseDate,
        }
      : null,
    streaming: entry?.streaming
      ? {
          exclusivity: entry.streaming.exclusivity ?? null,
          windowEnd: entry.streaming.windowEnd ?? null,
          platforms: entry.streaming.platforms.map((p) => ({
            platform: p.platform,
            status: p.status,
            liveDate: p.liveDate ?? null,
            endDate: p.endDate ?? null,
            regions: p.regions,
            drm: p.drm,
            // Compact bitrate summary — max resolution + codec set + HDR flag
            maxResolution: (() => {
              const rank: Record<string, number> = { "480p": 1, "720p": 2, "1080p": 3, "4K": 4 };
              let best: "480p" | "720p" | "1080p" | "4K" = "480p";
              for (const b of p.bitrates) {
                if ((rank[b.resolution] ?? 0) > (rank[best] ?? 0)) best = b.resolution;
              }
              return best;
            })(),
            hasHDR: p.bitrates.some((b) => b.hdr && b.hdr !== "sdr"),
            hasAtmos: p.bitrates.some((b) => b.audio === "atmos"),
            codecs: Array.from(new Set(p.bitrates.map((b) => b.codec))),
            variantCount: p.bitrates.length,
          })),
        }
      : null,
  });
}
