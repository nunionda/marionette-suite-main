import { NextResponse } from "next/server";
import { findFinancingByProject } from "../../../../lib/financing/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const financing = findFinancingByProject(pid);

  const pct = financing
    ? Math.round((financing.totalRaised / financing.totalBudget) * 100)
    : 0;

  return NextResponse.json({
    found: !!financing,
    paperclipId: pid,
    steps: {
      budgetDefined: !!financing?.totalBudget,
      partiallyFinanced: pct >= 40,
      fullyFinanced: financing?.status === "fully_financed" || financing?.status === "greenlit",
    },
    status: financing?.status ?? null,
    totalBudget: financing?.totalBudget ?? null,
    totalRaised: financing?.totalRaised ?? null,
    raisedPercent: pct,
    greenlitDate: financing?.greenlitDate ?? null,
  });
}
