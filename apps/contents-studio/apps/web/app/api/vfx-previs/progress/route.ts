import { NextResponse } from "next/server";
import { MOCK_SHOTS } from "../../../../lib/vfx-previs/mock-entries";

export async function GET() {
  const found = MOCK_SHOTS.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const final = MOCK_SHOTS.filter((s) => s.status === "final").length;
  const progress = Math.round((final / MOCK_SHOTS.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: {
      total: MOCK_SHOTS.length,
      final,
      totalFrames: MOCK_SHOTS.reduce((n, s) => n + s.frameCount, 0),
    },
  });
}
