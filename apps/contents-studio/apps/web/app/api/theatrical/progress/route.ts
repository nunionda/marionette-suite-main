import { NextResponse } from "next/server";
import { mockTheatricalReleases } from "../../../../lib/theatrical/mock-entries";

export async function GET() {
  const found = mockTheatricalReleases.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const completed = mockTheatricalReleases.filter(
    (t) => t.phase === "completed" || t.phase === "in-release",
  ).length;
  const progress = Math.round((completed / mockTheatricalReleases.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: mockTheatricalReleases.length, completed },
  });
}
