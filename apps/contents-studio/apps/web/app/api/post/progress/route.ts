import { NextResponse } from "next/server";
import {
  mockProjects,
  mockDeliveries,
} from "../../../../lib/post/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json({ error: "paperclipId required" }, { status: 400 });
  }

  const project = mockProjects.find((p) => p.id === pid);
  if (!project) {
    return NextResponse.json({ found: false, paperclipId: pid });
  }

  const deliveredCount = mockDeliveries.filter(
    (d) => d.projectId === pid && d.status === "delivered",
  ).length;

  return NextResponse.json({
    found: true,
    paperclipId: pid,
    steps: {
      edit:     project.editProgress >= 100,
      vfx:      project.vfxShots.total   > 0 && project.vfxShots.done   === project.vfxShots.total,
      sound:    project.soundReels.total > 0 && project.soundReels.done === project.soundReels.total,
      color:    project.colorReels.total > 0 && project.colorReels.done === project.colorReels.total,
      delivery: deliveredCount > 0,
    },
    progress: {
      edit:  project.editProgress,
      vfx:   { done: project.vfxShots.done,   total: project.vfxShots.total },
      sound: { done: project.soundReels.done, total: project.soundReels.total },
      color: { done: project.colorReels.done, total: project.colorReels.total },
    },
  });
}
