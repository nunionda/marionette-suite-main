import { NextResponse } from "next/server";
import {
  findCrewByProject,
  summarizeCrew,
} from "../../../../lib/crew/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const crew = findCrewByProject(pid);
  const summary = summarizeCrew(crew);

  return NextResponse.json({
    found: crew.length > 0,
    paperclipId: pid,
    steps: {
      started: crew.length > 0,
      keyHired: summary.keyHired > 0,
      locked: summary.total > 0 && summary.searching === 0,
    },
    summary,
    departments: [...new Set(crew.map((c) => c.department))],
  });
}
