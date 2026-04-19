import { NextResponse } from "next/server";
import {
  findContractsByProject,
  summarizeContracts,
} from "../../../../lib/contracts/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const contracts = findContractsByProject(pid);
  const summary = summarizeContracts(contracts);

  return NextResponse.json({
    found: contracts.length > 0,
    paperclipId: pid,
    steps: {
      started: contracts.length > 0,
      underReview: summary.review > 0,
      locked: summary.total > 0 && summary.signed === summary.total,
    },
    summary,
    topContracts: contracts.slice(0, 3).map((c) => ({
      locationName: c.locationName,
      status: c.status,
      totalFeeKRW: c.totalFeeKRW,
    })),
  });
}
