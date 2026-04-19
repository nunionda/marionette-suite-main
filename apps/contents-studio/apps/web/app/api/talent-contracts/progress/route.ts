import { NextResponse } from "next/server";
import {
  findTalentContractsByProject,
  summarizeTalentContracts,
} from "../../../../lib/talent-contracts/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const contracts = findTalentContractsByProject(pid);
  const summary = summarizeTalentContracts(contracts);

  return NextResponse.json({
    found: contracts.length > 0,
    paperclipId: pid,
    steps: {
      started: contracts.length > 0,
      leadsLocked: summary.leadsLocked === summary.leads && summary.leads > 0,
      allSigned: summary.total > 0 && summary.signed === summary.total,
    },
    summary,
    leads: contracts
      .filter((c) => c.role === "lead")
      .map((c) => ({
        actorName: c.actorName,
        characterName: c.characterName,
        status: c.status,
      })),
  });
}
