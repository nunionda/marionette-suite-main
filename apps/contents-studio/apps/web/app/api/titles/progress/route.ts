import { NextResponse } from "next/server";
import {
  computeTitleSummary,
  findTitlesByProject,
} from "../../../../lib/titles/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const cards = findTitlesByProject(pid);
  const summary = computeTitleSummary(cards);
  const mainTitle = cards.find((c) => c.kind === "main_title");

  return NextResponse.json({
    found: cards.length > 0,
    paperclipId: pid,
    steps: {
      drafted: cards.length > 0,
      inReview: summary.review > 0,
      approved: summary.total > 0 && summary.approved === summary.total,
    },
    summary,
    mainTitle: mainTitle
      ? {
          text: mainTitle.text ?? null,
          font: mainTitle.font ?? null,
          durationSec: mainTitle.durationSec ?? null,
          status: mainTitle.status,
        }
      : null,
  });
}
