import { NextResponse } from "next/server";
import {
  computeFestivalSummary,
  findFestivalsByProject,
} from "../../../../lib/festivals/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const entries = findFestivalsByProject(pid);
  const summary = computeFestivalSummary(entries);

  // Next upcoming deadline (pending entries, earliest deadline)
  const nextDeadline = entries
    .filter((e) => e.status === "pending")
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];

  const aList = entries.filter((e) => e.tier === "A").length;

  return NextResponse.json({
    found: entries.length > 0,
    paperclipId: pid,
    steps: {
      planned: entries.length > 0,
      submitted: summary.submitted > 0,
      selected: summary.selected > 0,
    },
    summary: {
      ...summary,
      aListFestivals: aList,
    },
    nextDeadline: nextDeadline
      ? {
          festivalName: nextDeadline.festivalName,
          deadline: nextDeadline.deadline,
          country: nextDeadline.country,
          tier: nextDeadline.tier,
        }
      : null,
  });
}
