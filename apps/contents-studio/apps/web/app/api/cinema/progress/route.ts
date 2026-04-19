/**
 * GET /api/cinema/progress?projectId=...
 *
 * Non-invasive progress emitter for the Cinema engine. Derives activity
 * from the ElementStore's existing `usedIn` reverse index — no changes
 * to the shot submission contract, no extra state to track.
 *
 * The "progress" model here is deliberately qualitative, not 0-100%:
 * creative generation has no natural completion percentage. Instead we
 * emit a `steps` map the aggregator already understands:
 *
 *   steps.cinema_used       — any element in this project has ever
 *                             been referenced by a cinema shot
 *   steps.cinema_recent     — a cinema usage exists within the last 24h
 *   steps.cinema_multi      — ≥3 distinct shots use elements
 *
 * PhaseStepper's rollup reads `steps` as "count(true)/total" so this
 * produces 0% / 33% / 66% / 100% as activity scales.
 */
import { NextResponse } from "next/server";
import { getCinemaEngine } from "../../../../lib/cinema/engine";

export const runtime = "nodejs";

const RECENT_MS = 24 * 60 * 60 * 1000;

function matchesEngine(nodeId: string, engine: "cinema" | "marketing"): boolean {
  return nodeId.startsWith(`${engine}:`);
}

function summarize(
  elements: { usedIn: { nodeId: string; usedAt: number }[] }[],
  engine: "cinema" | "marketing",
): {
  steps: Record<string, boolean>;
  summary: string;
  totalUsages: number;
  distinctNodeIds: number;
} {
  const usages = elements.flatMap((el) =>
    el.usedIn.filter((u) => matchesEngine(u.nodeId, engine)),
  );
  const distinctNodeIds = new Set(usages.map((u) => u.nodeId)).size;
  const now = Date.now();
  const recentCount = usages.filter((u) => now - u.usedAt < RECENT_MS).length;

  return {
    steps: {
      [`${engine}_used`]: usages.length > 0,
      [`${engine}_recent`]: recentCount > 0,
      [`${engine}_multi`]: distinctNodeIds >= 3,
    },
    summary: `${distinctNodeIds} distinct shot${
      distinctNodeIds === 1 ? "" : "s"
    } referencing elements · ${usages.length} total usage${
      usages.length === 1 ? "" : "s"
    }${recentCount > 0 ? ` · ${recentCount} in last 24h` : ""}`,
    totalUsages: usages.length,
    distinctNodeIds,
  };
}

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
    const stats = summarize(elements, "cinema");
    return NextResponse.json({
      paperclipId: projectId,
      found: true,
      ...stats,
    });
  } catch (err) {
    console.error("[cinema/progress] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
