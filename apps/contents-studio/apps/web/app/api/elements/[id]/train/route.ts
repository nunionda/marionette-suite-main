/**
 * POST /api/elements/[id]/train — kick off Soul-ID training as a job.
 *
 * Returns { jobId } immediately — client polls /api/cinema/shots/[jobId]
 * (or a future /api/jobs/[jobId] generic endpoint) for progress + final
 * identity.
 *
 * Uses the shared JobQueue from the cinema composition root. Training
 * handler is registered in lib/elements/engine.ts.
 */
import { NextResponse } from "next/server";
import { getCinemaEngine } from "../../../../../lib/cinema/engine";
import { getElementsEngine } from "../../../../../lib/elements/engine";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Ensure the training handler is registered.
  getElementsEngine();
  const { queue, store } = getCinemaEngine();
  const { id } = await params;

  const el = await store.get(id);
  if (!el) {
    return NextResponse.json({ error: "element not found" }, { status: 404 });
  }
  if (el.references.length === 0) {
    return NextResponse.json(
      {
        error:
          "element has no references. Add at least one image URL before training.",
      },
      { status: 400 },
    );
  }

  try {
    const jobId = await queue.submit(
      "elements:train-soul",
      { elementId: id },
      { maxAttempts: 1 },
    );
    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err) {
    console.error(`[elements/${id}/train] submit failed`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "submit failed" },
      { status: 500 },
    );
  }
}
