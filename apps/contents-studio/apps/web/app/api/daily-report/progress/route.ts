import { NextResponse } from "next/server";
import { mockDailyReports, summarizeReports } from "../../../../lib/daily-report/mock-entries";

export async function GET() {
  const found = mockDailyReports.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const byProject = new Map<string, typeof mockDailyReports>();
  for (const r of mockDailyReports) {
    const arr = byProject.get(r.projectId) ?? [];
    arr.push(r);
    byProject.set(r.projectId, arr);
  }

  const allSummaries = Array.from(byProject.entries()).map(([projectId, reports]) => ({
    projectId,
    ...summarizeReports(reports),
  }));

  const totalReports = mockDailyReports.length;
  const approvedReports = mockDailyReports.filter((r) => r.status === "approved").length;
  const progress = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: {
      totalReports,
      approvedReports,
      projects: allSummaries,
    },
  });
}
