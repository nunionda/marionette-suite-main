import { NextResponse } from "next/server";
import { MOCK_VERSIONS } from "../../../../lib/picture-lock/mock-entries";

export async function GET() {
  if (!MOCK_VERSIONS.length) {
    return NextResponse.json({ found: false });
  }

  const locked         = MOCK_VERSIONS.filter((v) => v.status === "locked").length;
  const producerCut    = MOCK_VERSIONS.filter((v) => v.status === "producer-cut").length;
  const directorCut    = MOCK_VERSIONS.filter((v) => v.status === "director-cut").length;
  const total          = MOCK_VERSIONS.length;

  const steps = [
    { label: "어셈블리 완료",   done: total > 0 },
    { label: "감독본 완료",     done: directorCut > 0 || producerCut > 0 || locked > 0 },
    { label: "제작사 승인",     done: producerCut > 0 || locked > 0 },
    { label: "픽처 락 확정",   done: locked > 0 },
  ];

  return NextResponse.json({
    found: true,
    paperclipId: MOCK_VERSIONS[0]?.projectId ?? null,
    steps,
    summary: { total, locked, producerCut, directorCut },
    topVersions: MOCK_VERSIONS.slice(0, 3).map((v) => ({
      id: v.id,
      version: v.version,
      status: v.status,
    })),
  });
}
