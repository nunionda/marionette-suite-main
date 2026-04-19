/**
 * GET /api/marketing/campaigns/progress?projectId=...
 *
 * Mirror of /api/cinema/progress for the Marketing engine. Uses the same
 * `Element.usedIn` reverse index — marketing shots record nodeIds with
 * the "marketing:" prefix via MarketingOrchestrator → CinemaOrchestrator.
 *
 * Route path includes `/campaigns` to avoid clashing with the existing
 * top-level /api/marketing/progress which is the hub's marketing-ops leg
 * (different concern: campaign spend tracking vs engine activity).
 */
import { NextResponse } from "next/server";
import { getCinemaEngine } from "../../../../../lib/cinema/engine";

export const runtime = "nodejs";

const RECENT_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { store } = getCinemaEngine();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 },
    );
  }

  try {
    const elements = await store.query({ projectId });
    const usages = elements.flatMap((el) =>
      el.usedIn.filter((u) => u.nodeId.startsWith("marketing:")),
    );
    const distinctNodeIds = new Set(usages.map((u) => u.nodeId)).size;
    const now = Date.now();
    const recentCount = usages.filter(
      (u) => now - u.usedAt < RECENT_MS,
    ).length;

    return NextResponse.json({
      paperclipId: projectId,
      found: true,
      steps: {
        marketingEngine_used: usages.length > 0,
        marketingEngine_recent: recentCount > 0,
        marketingEngine_multi: distinctNodeIds >= 3,
      },
      summary: `${distinctNodeIds} distinct campaign variant${
        distinctNodeIds === 1 ? "" : "s"
      } referencing elements · ${usages.length} total usage${
        usages.length === 1 ? "" : "s"
      }${recentCount > 0 ? ` · ${recentCount} in last 24h` : ""}`,
      totalUsages: usages.length,
      distinctNodeIds,
    });
  } catch (err) {
    console.error("[marketing/campaigns/progress] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
