import { NextResponse } from "next/server";
import {
  findReviewsByProject,
  computeReviewSummary,
} from "../../../../lib/reviews/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const entries = findReviewsByProject(pid);
  if (entries.length === 0) {
    return NextResponse.json({ found: false, paperclipId: pid });
  }

  const summary = computeReviewSummary(entries);

  return NextResponse.json({
    found: true,
    paperclipId: pid,
    steps: {
      published: summary.total > 0,
      criticsAggregated: summary.criticsCount > 0,
      audienceAggregated: summary.audienceCount > 0,
    },
    summary,
    topReview: entries[0]
      ? {
          outlet: entries[0].outlet,
          reviewer: entries[0].reviewer ?? null,
          score: entries[0].score,
          headline: entries[0].headline ?? null,
          sentiment: entries[0].sentiment,
          publishedAt: entries[0].publishedAt,
        }
      : null,
  });
}
