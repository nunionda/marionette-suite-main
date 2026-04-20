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
    where: { projectId: pid, stage: "financing" },
    orderBy: { createdAt: "desc" },
  });

  const content = (entry?.content ?? {}) as Record<string, unknown>;
  const totalBudget = (content.totalBudget as number | undefined) ?? 0;
  const totalRaised = (content.totalRaised as number | undefined) ?? 0;

  const pct =
    totalBudget > 0 ? Math.round((totalRaised / totalBudget) * 100) : 0;

  const status = entry?.status ?? null;

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: {
      budgetDefined: totalBudget > 0,
      partiallyFinanced: pct >= 40,
      fullyFinanced: status === "fully_financed" || status === "greenlit",
    },
    status,
    totalBudget: totalBudget || null,
    totalRaised: totalRaised || null,
    raisedPercent: pct,
    greenlitDate: (content.greenlitDate as string | undefined) ?? null,
  });
}
