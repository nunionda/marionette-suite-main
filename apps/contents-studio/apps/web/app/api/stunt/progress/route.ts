import { NextResponse } from "next/server";
import { MOCK_SEQUENCES } from "../../../../lib/stunt/mock-entries";

export async function GET() {
  const found = MOCK_SEQUENCES.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const cleared = MOCK_SEQUENCES.filter(
    (s) => s.status === "safety-cleared" || s.status === "completed",
  ).length;
  const progress = Math.round((cleared / MOCK_SEQUENCES.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: MOCK_SEQUENCES.length, cleared },
  });
}
