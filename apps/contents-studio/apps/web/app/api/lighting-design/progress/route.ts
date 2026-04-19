import { NextResponse } from "next/server";
import { MOCK_PLANS } from "../../../../lib/lighting-design/mock-entries";

export async function GET() {
  const found = MOCK_PLANS.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const locked = MOCK_PLANS.filter((p) => p.status === "locked").length;
  const progress = Math.round((locked / MOCK_PLANS.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: MOCK_PLANS.length, locked },
  });
}
