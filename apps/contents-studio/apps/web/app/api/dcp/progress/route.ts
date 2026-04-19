import { NextResponse } from "next/server";
import { mockDCPPackages } from "../../../../lib/dcp/mock-entries";

export async function GET() {
  const found = mockDCPPackages.length > 0;
  if (!found) return NextResponse.json({ found: false, progress: 0, summary: null });

  const delivered = mockDCPPackages.filter(
    (d) => d.status === "delivered" || d.status === "screened",
  ).length;
  const progress = Math.round((delivered / mockDCPPackages.length) * 100);

  return NextResponse.json({
    found: true,
    progress,
    summary: { total: mockDCPPackages.length, delivered },
  });
}
