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
    where: { projectId: pid, stage: "pitch" },
    orderBy: { createdAt: "desc" },
  });

  const content = (entry?.content ?? {}) as Record<string, unknown>;
  const meetings = Array.isArray(content.meetings)
    ? (content.meetings as Array<{ outcome: string }>)
    : [];
  const interestedCount = meetings.filter(
    (m) => m.outcome === "interested" || m.outcome === "greenlit",
  ).length;

  const status = entry?.status ?? null;

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: {
      deckReady: status === "ready" || status === "pitched" || status === "greenlit",
      hasMeetings: meetings.length > 0,
      greenlit: status === "greenlit",
    },
    status,
    deckVersion: (content.deckVersion as string | undefined) ?? null,
    meetingCount: meetings.length,
    interestedCount,
    askAmount: (content.askAmount as number | undefined) ?? null,
  });
}
