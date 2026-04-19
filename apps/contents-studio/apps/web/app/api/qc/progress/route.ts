import { NextResponse } from "next/server";
import { mockQCChecks, summarizeQC } from "../../../../lib/qc/mock-entries";

export async function GET() {
  const found = mockQCChecks.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const { total, passed } = summarizeQC(mockQCChecks);
  const progress = total > 0 ? Math.round((passed / total) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: { total, passed },
  });
}
