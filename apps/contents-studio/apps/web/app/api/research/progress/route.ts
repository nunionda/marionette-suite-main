import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/server-session";
import { prisma } from "@marionette/db";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const entry = await prisma.developmentEntry.findFirst({
    where: { projectId: pid, stage: "research" },
    orderBy: { createdAt: "desc" },
  });

  const content = (entry?.content ?? {}) as Record<string, unknown>;
  const categories = Array.isArray(content.categories)
    ? (content.categories as Array<{ category: string; status: string }>)
    : [];
  const comparableTitles = Array.isArray(content.comparableTitles)
    ? (content.comparableTitles as string[])
    : [];
  const completedCount = categories.filter((c) => c.status === "complete").length;

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: {
      marketResearchDone: categories.some(
        (c) => c.category.includes("시장") && c.status === "complete",
      ),
      comparableTitlesDone: comparableTitles.length > 0,
      allCategoriesComplete: entry?.status === "complete",
    },
    overallStatus: entry?.status ?? null,
    completedCategories: completedCount,
    totalCategories: categories.length,
    marketSize: (content.marketSize as string | undefined) ?? null,
  });
}
