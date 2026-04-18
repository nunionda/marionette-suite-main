import { NextResponse } from "next/server";
import {
  computeBudgetSummary,
  findBudgetByProject,
} from "../../../../lib/budget/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const budget = findBudgetByProject(pid);
  if (!budget) {
    return NextResponse.json({
      found: false,
      paperclipId: pid,
      steps: { drafted: false, approved: false },
    });
  }

  const summary = computeBudgetSummary(budget);

  return NextResponse.json({
    found: true,
    paperclipId: pid,
    steps: {
      drafted: budget.status === "draft" || budget.status === "submitted"
        || budget.status === "approved" || budget.status === "locked",
      approved: budget.status === "approved" || budget.status === "locked",
    },
    status: budget.status,
    totalAllocated: budget.totalAllocated,
    currency: budget.currency,
    summary,
    departments: budget.lineItems.map((li) => ({
      department: li.department,
      allocated: li.allocated,
      spent: li.spent,
    })),
  });
}
