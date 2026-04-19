import { NextResponse } from "next/server";
import { mockPressAssets, summarizePress } from "../../../../lib/press-kit/mock-entries";

export async function GET() {
  const found = mockPressAssets.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const { total, ready } = summarizePress(mockPressAssets);
  const progress = total > 0 ? Math.round((ready / total) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: { total, ready },
  });
}
