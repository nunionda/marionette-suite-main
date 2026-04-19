import { NextResponse } from "next/server";
import { mockArchiveAssets } from "../../../../lib/archive/mock-entries";

export async function GET() {
  const found = mockArchiveAssets.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const active = mockArchiveAssets.filter((a) => a.status === "active").length;
  const progress = Math.round((active / mockArchiveAssets.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: mockArchiveAssets.length, active },
  });
}
