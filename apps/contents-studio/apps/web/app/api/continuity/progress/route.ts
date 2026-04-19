import { NextResponse } from "next/server";
import { MOCK_ISSUES } from "../../../../lib/continuity/mock-entries";

export async function GET() {
  const found = MOCK_ISSUES.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const resolved = MOCK_ISSUES.filter(
    (i) => i.status === "fixed" || i.status === "accepted",
  ).length;
  const progress = Math.round((resolved / MOCK_ISSUES.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: MOCK_ISSUES.length, resolved },
  });
}
