/**
 * GET    /api/jobs/[jobId] — generic job poll.
 * DELETE /api/jobs/[jobId] — generic cancel.
 *
 * All job types (cinema:shot, marketing:campaign, elements:train-soul)
 * live on the same JobQueue — this endpoint polls any of them without
 * the client knowing the type.
 *
 * The typed endpoints (/api/cinema/shots/[jobId] etc.) remain for
 * route-specific logic (e.g. output schema validation) but the client
 * can use this generic one when the type isn't meaningful to the UI.
 */
import { NextResponse } from "next/server";
import { getCinemaEngine } from "../../../../lib/cinema/engine";

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
    console.error(`[jobs/${jobId}] status failed`, err);
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
      return NextResponse.json({ error: "not cancelable" }, { status: 409 });
    }
    return NextResponse.json({ canceled: true });
  } catch (err) {
    console.error(`[jobs/${jobId}] cancel failed`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "cancel failed" },
      { status: 500 },
    );
  }
}
