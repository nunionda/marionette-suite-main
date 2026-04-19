import { NextResponse } from "next/server";
import { MOCK_REELS } from "../../../../lib/conform/mock-entries";

export async function GET() {
  const found = MOCK_REELS.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const delivered = MOCK_REELS.filter((r) => r.status === "delivered").length;
  const progress = Math.round((delivered / MOCK_REELS.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: MOCK_REELS.length, delivered },
  });
}
