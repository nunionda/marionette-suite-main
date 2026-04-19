import { NextResponse } from "next/server";
import { MOCK_SHOOT_DAYS } from "../../../../lib/photography/mock-entries";

export async function GET() {
  const found = MOCK_SHOOT_DAYS.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const completed = MOCK_SHOOT_DAYS.filter((d) => d.status === "completed").length;
  const progress = Math.round((completed / MOCK_SHOOT_DAYS.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: {
      total: MOCK_SHOOT_DAYS.length,
      completed,
      totalSetups: MOCK_SHOOT_DAYS.reduce((n, d) => n + d.setups, 0),
    },
  });
}
