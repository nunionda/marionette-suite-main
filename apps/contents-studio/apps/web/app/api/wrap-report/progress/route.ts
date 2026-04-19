import { NextResponse } from "next/server";
import { mockWrapReports } from "../../../../lib/wrap-report/mock-entries";

export async function GET() {
  const found = mockWrapReports.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const delivered = mockWrapReports.filter(
    (w) => w.status === "final" || w.status === "delivered",
  ).length;
  const progress = Math.round((delivered / mockWrapReports.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: {
      total: mockWrapReports.length,
      delivered,
    },
  });
}
