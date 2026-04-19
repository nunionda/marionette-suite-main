import { NextResponse } from "next/server";
import {
  findEquipmentByProject,
  summarizeEquipment,
} from "../../../../lib/equipment/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const items = findEquipmentByProject(pid);
  const summary = summarizeEquipment(items);

  return NextResponse.json({
    found: items.length > 0,
    paperclipId: pid,
    steps: {
      started: items.length > 0,
      reserved: summary.reserved > 0 || summary.confirmed > 0,
      locked: summary.total > 0 && summary.sourcing === 0,
    },
    summary,
    categories: [...new Set(items.map((e) => e.category))],
  });
}
