import { NextResponse } from "next/server";
import { mockIntlDeals, summarizeIntl } from "../../../../lib/international/mock-entries";

export async function GET() {
  const found = mockIntlDeals.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const { total, closed } = summarizeIntl(mockIntlDeals);
  const progress = total > 0 ? Math.round((closed / total) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: { total, closed },
  });
}
