import { NextResponse } from "next/server";
import { mockEntries } from "../../../../lib/library/mock-entries";
import { readPromoted } from "../../../../lib/library/promoted-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const promoted = await readPromoted();
  const promotedIds = new Set(promoted.map((e) => e.projectId));
  const allEntries = [
    ...mockEntries.filter((e) => !promotedIds.has(e.projectId)),
    ...promoted,
  ];
  const entry = allEntries.find((e) => e.projectId === pid);

  return NextResponse.json({
    found: !!entry,
    paperclipId: pid,
    steps: { publish: !!entry },
    entry: entry
      ? {
          id: entry.id,
          title: entry.title,
          channels: entry.channels,
          deliverables: entry.deliverables,
          releaseDate: entry.releaseDate,
        }
      : null,
  });
}
