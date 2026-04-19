import { NextResponse } from "next/server";
import { findResearchByProject } from "../../../../lib/research/mock-entries";
import { requireSession } from "../../../../lib/server-session";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const research = findResearchByProject(pid);

  const categories = research?.categories ?? [];
  const completedCount = categories.filter((c) => c.status === "complete").length;

  return NextResponse.json({
    found: !!research,
    paperclipId: pid,
    steps: {
      marketResearchDone: categories.some(
        (c) => c.category.includes("시장") && c.status === "complete"
      ),
      comparableTitlesDone: (research?.comparableTitles?.length ?? 0) > 0,
      allCategoriesComplete: research?.overallStatus === "complete",
    },
    overallStatus: research?.overallStatus ?? null,
    completedCategories: completedCount,
    totalCategories: categories.length,
    marketSize: research?.marketSize ?? null,
  });
}
