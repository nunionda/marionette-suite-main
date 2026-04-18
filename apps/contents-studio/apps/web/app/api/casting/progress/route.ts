import { NextResponse } from "next/server";
import {
  computeCastingSummary,
  findCastingsByProject,
} from "../../../../lib/casting/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const entries = findCastingsByProject(pid);
  const summary = computeCastingSummary(entries);

  return NextResponse.json({
    found: entries.length > 0,
    paperclipId: pid,
    steps: {
      started: entries.length > 0,
      auditioning: summary.auditioning > 0,
      locked: summary.total > 0 && summary.signed === summary.total,
    },
    summary,
    leads: entries
      .filter((e) => e.characterRole === "lead")
      .map((e) => ({
        characterName: e.characterName,
        actorName: e.actorName ?? null,
        state: e.state,
      })),
  });
}
