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
    where: { projectId: pid, stage: "rights" },
    orderBy: { createdAt: "desc" },
  });

  const content = (entry?.content ?? {}) as Record<string, unknown>;
  const items = Array.isArray(content.items)
    ? (content.items as Array<{ type: string; status: string }>)
    : [];
  const hasIssues = items.some((i) => i.status === "issue");
  const allClear = items.every(
    (i) => i.status === "clear" || i.status === "not_applicable",
  );

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: {
      scriptIpClear: items.some((i) => i.type === "script_ip" && i.status === "clear"),
      noBlockingIssues: !hasIssues,
      overallClear: entry?.status === "clear",
    },
    overallStatus: entry?.status ?? null,
    hasIssues,
    allClear,
    legalCounsel: (content.legalCounsel as string | undefined) ?? null,
  });
}
