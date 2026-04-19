import { NextResponse } from "next/server";
import { findRightsByProject } from "../../../../lib/rights/mock-entries";
import { requireSession } from "../../../../lib/server-session";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const rights = findRightsByProject(pid);

  const items = rights?.items ?? [];
  const hasIssues = items.some((i) => i.status === "issue");
  const allClear = items.every((i) => i.status === "clear" || i.status === "not_applicable");

  return NextResponse.json({
    found: !!rights,
    paperclipId: pid,
    steps: {
      scriptIpClear: items.some((i) => i.type === "script_ip" && i.status === "clear"),
      noBlockingIssues: !hasIssues,
      overallClear: rights?.overallStatus === "clear",
    },
    overallStatus: rights?.overallStatus ?? null,
    hasIssues,
    allClear,
    legalCounsel: rights?.legalCounsel ?? null,
  });
}
