import { NextResponse } from "next/server";
import { findShootDaysByProject } from "../../../../lib/schedule/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const days = findShootDaysByProject(pid);
  const total = days.length;
  const wrapped = days.filter((d) => d.status === "wrapped").length;
  const inProgress = days.filter((d) => d.status === "in_progress").length;

  return NextResponse.json({
    found: total > 0,
    paperclipId: pid,
    steps: {
      scheduled: total > 0,
      shooting: inProgress > 0,
      wrapped: total > 0 && wrapped === total,
    },
    progress: {
      totalDays: total,
      wrappedDays: wrapped,
      inProgressDays: inProgress,
      scheduledDays: total - wrapped - inProgress,
    },
    nextDay: days.find((d) => d.status === "scheduled") ?? null,
    activeDay: days.find((d) => d.status === "in_progress") ?? null,
  });
}
