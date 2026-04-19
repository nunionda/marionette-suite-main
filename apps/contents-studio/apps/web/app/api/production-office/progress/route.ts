import { NextResponse } from "next/server";
import {
  findProductionOfficeByProject,
  summarizeProductionOffice,
} from "../../../../lib/production-office/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const items = findProductionOfficeByProject(pid);
  const summary = summarizeProductionOffice(items);

  return NextResponse.json({
    found: items.length > 0,
    paperclipId: pid,
    steps: {
      started: items.length > 0,
      spaceSecured: items.some(
        (o) =>
          o.category === "space" &&
          (o.status === "operational" || o.status === "setup"),
      ),
      locked: summary.total > 0 && summary.pending === 0,
    },
    summary,
    categories: [...new Set(items.map((o) => o.category))],
  });
}
