import { NextResponse } from "next/server";
import { MOCK_SESSIONS } from "../../../../lib/final-mix/mock-entries";

export async function GET() {
  if (!MOCK_SESSIONS.length) {
    return NextResponse.json({ found: false });
  }

  const delivered = MOCK_SESSIONS.filter((s) => s.status === "delivered").length;
  const approved  = MOCK_SESSIONS.filter((s) => s.status === "approved").length;
  const inMix     = MOCK_SESSIONS.filter((s) => s.status === "mix-in-progress").length;
  const total     = MOCK_SESSIONS.length;

  const steps = [
    { label: "믹싱 세션 스케줄",   done: total > 0 },
    { label: "믹싱 작업 진행",     done: inMix > 0 || approved > 0 || delivered > 0 },
    { label: "파이널 믹스 승인",   done: approved > 0 || delivered > 0 },
    { label: "납품 완료",          done: delivered > 0 },
  ];

  return NextResponse.json({
    found: true,
    paperclipId: MOCK_SESSIONS[0]?.projectId ?? null,
    steps,
    summary: { total, delivered, approved, inMix },
    topSessions: MOCK_SESSIONS.slice(0, 3).map((s) => ({
      id: s.id,
      reel: s.reel,
      mixer: s.mixer,
      status: s.status,
    })),
  });
}
