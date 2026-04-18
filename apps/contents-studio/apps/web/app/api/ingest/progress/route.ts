import { NextResponse } from "next/server";
import {
  computeIngestSummary,
  findFootageByProject,
} from "../../../../lib/ingest/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const batches = findFootageByProject(pid);
  const summary = computeIngestSummary(batches);

  return NextResponse.json({
    found: batches.length > 0,
    paperclipId: pid,
    steps: {
      ingesting: batches.length > 0,
      verified: summary.verified > 0,
      archived: summary.total > 0 && summary.archived === summary.total,
    },
    summary,
    latestBatch: batches.at(-1) ?? null,
  });
}
