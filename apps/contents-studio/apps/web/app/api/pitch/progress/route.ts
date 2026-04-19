import { NextResponse } from "next/server";
import { findPitchByProject } from "../../../../lib/pitch/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const pitch = findPitchByProject(pid);

  const meetings = pitch?.meetings ?? [];
  const interestedCount = meetings.filter((m) => m.outcome === "interested" || m.outcome === "greenlit").length;

  return NextResponse.json({
    found: !!pitch,
    paperclipId: pid,
    steps: {
      deckReady: pitch?.status === "ready" || pitch?.status === "pitched" || pitch?.status === "greenlit",
      hasMeetings: meetings.length > 0,
      greenlit: pitch?.status === "greenlit",
    },
    status: pitch?.status ?? null,
    deckVersion: pitch?.deckVersion ?? null,
    meetingCount: meetings.length,
    interestedCount,
    askAmount: pitch?.askAmount ?? null,
  });
}
