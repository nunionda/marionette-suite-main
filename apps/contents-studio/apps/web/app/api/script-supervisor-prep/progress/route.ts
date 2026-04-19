import { NextResponse } from "next/server";
import { MOCK_DOCS } from "../../../../lib/script-supervisor-prep/mock-entries";

export async function GET() {
  const found = MOCK_DOCS.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const approved = MOCK_DOCS.filter((d) => d.status === "approved").length;
  const progress = Math.round((approved / MOCK_DOCS.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: {
      total: MOCK_DOCS.length,
      approved,
      totalPages: MOCK_DOCS.reduce((n, d) => n + d.pageCount, 0),
    },
  });
}
