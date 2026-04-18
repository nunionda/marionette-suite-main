import { NextResponse } from "next/server";
import {
  computeLocationSummary,
  findLocationsByProject,
} from "../../../../lib/locations/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const locations = findLocationsByProject(pid);
  const summary = computeLocationSummary(locations);

  return NextResponse.json({
    found: locations.length > 0,
    paperclipId: pid,
    steps: {
      scouting: locations.length > 0,
      permitted: summary.permitted > 0,
      locked: summary.total > 0 && summary.confirmed === summary.total,
    },
    summary,
    topLocations: locations.slice(0, 3).map((l) => ({
      name: l.name,
      interior: l.interior,
      status: l.status,
    })),
  });
}
