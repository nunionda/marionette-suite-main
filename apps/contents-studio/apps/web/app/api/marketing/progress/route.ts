import { NextResponse } from "next/server";
import {
  computeMarketingSummary,
  findAssetsByProject,
} from "../../../../lib/marketing/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const assets = findAssetsByProject(pid);
  const summary = computeMarketingSummary(assets);

  // Flagship: main_trailer or main_poster (whichever is most progressed)
  const flagshipTrailer = assets
    .filter((a) => a.kind === "main_trailer")
    .sort((a, b) => {
      const order = { live: 0, delivered: 1, approved: 2, in_review: 3, draft: 4 };
      return order[a.status] - order[b.status];
    })[0];
  const flagshipPoster = assets
    .filter((a) => a.kind === "main_poster" || a.kind === "key_art")
    .sort((a, b) => {
      const order = { live: 0, delivered: 1, approved: 2, in_review: 3, draft: 4 };
      return order[a.status] - order[b.status];
    })[0];

  return NextResponse.json({
    found: assets.length > 0,
    paperclipId: pid,
    steps: {
      drafted: assets.length > 0,
      inReview: summary.inReview > 0,
      approved: summary.total > 0 && summary.approved === summary.total,
    },
    summary,
    flagship: {
      trailer: flagshipTrailer
        ? {
            label: flagshipTrailer.label,
            durationSec: flagshipTrailer.durationSec ?? null,
            status: flagshipTrailer.status,
            aiGenerated: !!flagshipTrailer.aiGenerated,
          }
        : null,
      poster: flagshipPoster
        ? {
            label: flagshipPoster.label,
            kind: flagshipPoster.kind,
            status: flagshipPoster.status,
            aiGenerated: !!flagshipPoster.aiGenerated,
          }
        : null,
    },
  });
}
