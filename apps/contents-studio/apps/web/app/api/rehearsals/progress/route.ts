import { NextResponse } from "next/server";
import {
  computeRehearsalSummary,
  findRehearsalsByProject,
} from "../../../../lib/rehearsals/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const sessions = findRehearsalsByProject(pid);
  const summary = computeRehearsalSummary(sessions);

  return NextResponse.json({
    found: sessions.length > 0,
    paperclipId: pid,
    steps: {
      scheduled: sessions.length > 0,
      started: summary.inProgress + summary.completed > 0,
      done: summary.total > 0 && summary.completed === summary.total,
    },
    summary,
    next: sessions.find((s) => s.status === "scheduled") ?? null,
    active: sessions.find((s) => s.status === "in_progress") ?? null,
  });
}
