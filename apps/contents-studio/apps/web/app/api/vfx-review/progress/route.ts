import { NextResponse } from "next/server";
import { MOCK_SHOTS } from "../../../../lib/vfx-review/mock-entries";

export async function GET() {
  if (!MOCK_SHOTS.length) {
    return NextResponse.json({ found: false });
  }

  const approved  = MOCK_SHOTS.filter((s) => s.status === "approved" || s.status === "locked").length;
  const inReview  = MOCK_SHOTS.filter((s) => s.status === "internal-review" || s.status === "vendor-review").length;
  const heroShots = MOCK_SHOTS.filter((s) => s.complexity === "hero").length;
  const total     = MOCK_SHOTS.length;

  const steps = [
    { label: "VFX 샷 리스트 확정", done: total > 0 },
    { label: "벤더 작업 개시",     done: MOCK_SHOTS.some((s) => s.status !== "pending") },
    { label: "내부 검토 완료",     done: approved > 0 },
    { label: "전체 샷 확정",       done: MOCK_SHOTS.every((s) => s.status === "locked") },
  ];

  return NextResponse.json({
    found: true,
    paperclipId: MOCK_SHOTS[0]?.projectId ?? null,
    steps,
    summary: { total, approved, inReview, heroShots },
    topShots: MOCK_SHOTS.slice(0, 3).map((s) => ({
      id: s.id,
      shotCode: s.shotCode,
      complexity: s.complexity,
      status: s.status,
    })),
  });
}
