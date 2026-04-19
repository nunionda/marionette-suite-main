import { NextResponse } from "next/server";
import { mockSalesDeals, summarizeDeals } from "../../../../lib/sales/mock-entries";

export async function GET() {
  const found = mockSalesDeals.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const { total, signed } = summarizeDeals(mockSalesDeals);
  const progress = total > 0 ? Math.round((signed / total) * 100) : 0;

  return NextResponse.json({
    found: true,
    progress,
    summary: { total, signed },
  });
}
