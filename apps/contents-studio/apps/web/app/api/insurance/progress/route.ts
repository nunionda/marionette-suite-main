import { NextResponse } from "next/server";
import {
  findInsuranceByProject,
  summarizeInsurance,
} from "../../../../lib/insurance/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const policies = findInsuranceByProject(pid);
  const summary = summarizeInsurance(policies);

  return NextResponse.json({
    found: policies.length > 0,
    paperclipId: pid,
    steps: {
      started: policies.length > 0,
      coreActive: summary.active > 0,
      locked: summary.total > 0 && summary.pending === 0,
    },
    summary,
    policyTypes: policies.map((p) => ({
      type: p.policyType,
      status: p.status,
    })),
  });
}
