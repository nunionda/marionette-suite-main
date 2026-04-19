import { NextResponse } from "next/server";
import { MOCK_SESSIONS } from "../../../../lib/on-set-sound/mock-entries";

export async function GET() {
  const found = MOCK_SESSIONS.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const approved = MOCK_SESSIONS.filter((s) => s.status === "approved").length;
  const progress = Math.round((approved / MOCK_SESSIONS.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: MOCK_SESSIONS.length, approved },
  });
}
