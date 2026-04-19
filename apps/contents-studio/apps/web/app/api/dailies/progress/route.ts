import { NextResponse } from "next/server";
import { MOCK_SESSIONS } from "../../../../lib/dailies/mock-entries";

export async function GET() {
  if (!MOCK_SESSIONS.length) {
    return NextResponse.json({ found: false });
  }

  const approved = MOCK_SESSIONS.filter((s) => s.status === "approved").length;
  const flagged  = MOCK_SESSIONS.filter((s) => s.status === "flagged").length;
  const total    = MOCK_SESSIONS.length;

  const steps = [
    { label: "촬영분 수집", done: true },
    { label: "시사 검토",   done: approved + flagged > 0 },
    { label: "승인 처리",   done: approved > 0 },
    { label: "재촬영 처리", done: flagged > 0 },
  ];

  return NextResponse.json({
    found: true,
    paperclipId: MOCK_SESSIONS[0]?.projectId ?? null,
    steps,
    summary: { total, approved, flagged },
    topSessions: MOCK_SESSIONS.slice(0, 3).map((s) => ({
      id: s.id,
      shootDay: s.shootDay,
      status: s.status,
    })),
  });
}
