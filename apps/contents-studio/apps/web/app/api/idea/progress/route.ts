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
    where: { projectId: pid, stage: "idea" },
    orderBy: { createdAt: "desc" },
  });

  const content = (entry?.content ?? {}) as Record<string, unknown>;

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: {
      loglineDefined: !!(content.logline as string | undefined)?.trim(),
      formatSet: !!content.format,
      approved: entry?.status === "approved",
    },
    status: entry?.status ?? null,
    title: entry?.title ?? null,
  });
}
