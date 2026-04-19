import { NextResponse } from "next/server";
import { mockAwardEntries, summarizeAwards } from "../../../../lib/awards/mock-entries";

export async function GET() {
  const found = mockAwardEntries.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const { total, nominated, won } = summarizeAwards(mockAwardEntries);
  const active = nominated + won;
  const progress = total > 0 ? Math.round((active / total) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: { total, nominated, won },
  });
}
