/**
 * GET    /api/cinema/shots/[jobId] — poll a submitted shot.
 * DELETE /api/cinema/shots/[jobId] — cancel a running shot.
 *
 * The Hub's cinema client polls this endpoint every 2s while the job is
 * pre-terminal. WebSocket-based streaming is a future sprint; polling
 * keeps the dependency surface flat and works everywhere (Vercel Fluid
 * Compute, containerized, local dev) without extra infra.
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
    console.error(`[cinema/shots/${jobId}] status failed`, err);
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
    console.error(`[cinema/shots/${jobId}] cancel failed`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "cancel failed" },
      { status: 500 },
    );
  }
}
