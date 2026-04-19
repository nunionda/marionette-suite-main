import { NextResponse } from "next/server";
import { findFinancingByProject } from "../../../../lib/financing/mock-entries";
import { requireSession } from "../../../../lib/server-session";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const financing = findFinancingByProject(pid);

  // Guard against totalBudget === 0 to avoid NaN / Infinity
  const pct =
    financing && financing.totalBudget > 0
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
