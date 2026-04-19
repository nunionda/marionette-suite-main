/**
 * GET /api/ai/jobs — rolling log summary (last 100 events) of all job
 * activity, aggregated per-jobId into JobSummary rows.
 */
import { NextResponse } from "next/server";
import {
  getAiOpsHistory,
  summarizeHistory,
} from "../../../../lib/ai-ops/history";

export const runtime = "nodejs";

export async function GET() {
  try {
    const log = getAiOpsHistory();
    const jobs = summarizeHistory(log);
    return NextResponse.json({
      jobs,
      totalEvents: log.length,
    });
  } catch (err) {
    console.error("[ai/jobs] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
