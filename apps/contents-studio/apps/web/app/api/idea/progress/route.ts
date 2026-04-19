import { NextResponse } from "next/server";
import { findIdeaByProject } from "../../../../lib/idea/mock-entries";
import { requireSession } from "../../../../lib/server-session";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const idea = findIdeaByProject(pid);

  return NextResponse.json({
    found: !!idea,
    paperclipId: pid,
    steps: {
      loglineDefined: !!idea?.logline,
      formatSet: !!idea?.format,
      approved: idea?.status === "approved",
    },
    status: idea?.status ?? null,
    title: idea?.title ?? null,
  });
}
