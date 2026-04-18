import { NextResponse } from "next/server";
import {
  findReleaseMeta,
  findBoxOfficeByProject,
  computeBoxOfficeSummary,
} from "../../../../lib/boxoffice/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const meta = findReleaseMeta(pid);
  const reports = findBoxOfficeByProject(pid);

  if (!meta) {
    return NextResponse.json({ found: false, paperclipId: pid });
  }

  const summary = computeBoxOfficeSummary(reports, meta);

  // Latest KR report — drives "topLine" display
  const latestKR = reports
    .filter((r) => r.territory === "KR")
    .slice(-1)[0] ?? null;

  return NextResponse.json({
    found: true,
    paperclipId: pid,
    steps: {
      released: meta.released,
      week1Done: summary.weeksInRelease >= 1,
      breakeven: summary.breakeven,
    },
    summary,
    meta: {
      releaseDate: meta.releaseDate ?? null,
      pattern: meta.pattern,
      budgetKRW: meta.budgetKRW,
    },
    latestWeek: latestKR
      ? {
          weekNumber: latestKR.weekNumber,
          weekStarting: latestKR.weekStarting,
          admissions: latestKR.admissions,
          revenue: latestKR.revenue,
          screens: latestKR.screens,
          rank: latestKR.rank,
          weekOverWeekPct: latestKR.weekOverWeekPct ?? null,
        }
      : null,
  });
}
