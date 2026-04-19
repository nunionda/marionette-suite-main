import { NextResponse } from "next/server";
import { MOCK_DELIVERABLES } from "../../../../lib/deliverables/mock-entries";

export async function GET() {
  if (!MOCK_DELIVERABLES.length) {
    return NextResponse.json({ found: false });
  }

  const delivered = MOCK_DELIVERABLES.filter((d) => d.status === "delivered").length;
  const approved  = MOCK_DELIVERABLES.filter((d) => d.status === "approved").length;
  const pending   = MOCK_DELIVERABLES.filter((d) => d.status === "pending").length;
  const total     = MOCK_DELIVERABLES.length;

  const steps = [
    { label: "납품 목록 확정",    done: total > 0 },
    { label: "인코딩 / QC 시작", done: total - pending > 0 },
    { label: "플랫폼 승인",      done: approved > 0 || delivered > 0 },
    { label: "전체 납품 완료",   done: delivered === total },
  ];

  return NextResponse.json({
    found: true,
    paperclipId: MOCK_DELIVERABLES[0]?.projectId ?? null,
    steps,
    summary: { total, delivered, approved, pending },
    topDeliverables: MOCK_DELIVERABLES.slice(0, 3).map((d) => ({
      id: d.id,
      name: d.name,
      platform: d.platform,
      status: d.status,
    })),
  });
}
