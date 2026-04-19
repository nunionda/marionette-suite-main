/**
 * GET    /api/marketing/campaigns/[jobId] — poll campaign status.
 * DELETE /api/marketing/campaigns/[jobId] — cancel in-flight campaign.
 *
 * Uses the shared job queue (same as cinema:shot) — progress + output shape
 * differ but the polling contract is identical.
 */
import { NextResponse } from "next/server";
import { getCinemaEngine } from "../../../../../lib/cinema/engine";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { queue } = getCinemaEngine();
  const { jobId } = await params;

  try {
    const rec = await queue.getStatus(jobId);
    if (!rec) {
      return NextResponse.json({ error: "unknown jobId" }, { status: 404 });
    }
    return NextResponse.json(rec);
  } catch (err) {
    console.error(`[marketing/campaigns/${jobId}] status failed`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "status failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { queue } = getCinemaEngine();
  const { jobId } = await params;

  try {
    const ok = await queue.cancel(jobId);
    if (!ok) {
      return NextResponse.json(
        { error: "job not cancelable (unknown or already terminal)" },
        { status: 409 },
      );
    }
    return NextResponse.json({ canceled: true });
  } catch (err) {
    console.error(`[marketing/campaigns/${jobId}] cancel failed`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "cancel failed" },
      { status: 500 },
    );
  }
}
