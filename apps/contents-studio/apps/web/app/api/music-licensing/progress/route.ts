import { NextResponse } from "next/server";
import { mockMusicLicenses, summarizeLicenses } from "../../../../lib/music-licensing/mock-entries";

export async function GET() {
  const found = mockMusicLicenses.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const { total, cleared } = summarizeLicenses(mockMusicLicenses);
  const progress = total > 0 ? Math.round((cleared / total) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: { total, cleared },
  });
}
