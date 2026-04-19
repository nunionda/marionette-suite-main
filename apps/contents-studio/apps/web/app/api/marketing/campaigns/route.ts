/**
 * POST /api/marketing/campaigns — submit a marketing campaign job.
 *
 * Body shape: CampaignJobInput from lib/marketing/engine.ts. Multi-variant
 * (1..4) runs sequentially inside the job handler so a single `jobId` tracks
 * the whole campaign with one progress stream.
 */
import { NextResponse } from "next/server";
import { getMarketingEngine } from "../../../../lib/marketing/engine";
import { getCinemaEngine } from "../../../../lib/cinema/engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Touch the marketing engine so its handler is registered on the queue.
  getMarketingEngine();
  const { queue } = getCinemaEngine();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = body as {
    product?: { name?: string };
    style?: string;
    platform?: string;
    variants?: number;
  };
  if (
    !b ||
    typeof b.product !== "object" ||
    typeof b.product?.name !== "string" ||
    typeof b.style !== "string" ||
    typeof b.platform !== "string"
  ) {
    return NextResponse.json(
      { error: "product.name, style, platform are required" },
      { status: 400 },
    );
  }

  try {
    const jobId = await queue.submit("marketing:campaign", body, {
      maxAttempts: 2,
      retryDelayMs: 5000,
    });
    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err) {
    console.error("[marketing/campaigns] submit failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "submit failed" },
      { status: 500 },
    );
  }
}
