import { NextResponse } from "next/server";
import type { StepProgress, StepStatus } from "@marionette/ui";

const SCRIPT_WRITER_API =
  process.env.SCRIPT_WRITER_API_URL ?? "http://localhost:3006";
const STORYBOARD_API =
  process.env.STORYBOARD_API_URL ?? "http://localhost:3007";

function boolToStatus(done: boolean): StepStatus {
  return done ? "in_progress" : "not_started";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [swResult, sbResult] = await Promise.allSettled([
    fetch(`${SCRIPT_WRITER_API}/api/progress?paperclipId=${encodeURIComponent(id)}`).then(
      (r) => r.json(),
    ),
    fetch(`${STORYBOARD_API}/api/progress?paperclipId=${encodeURIComponent(id)}`).then(
      (r) => r.json(),
    ),
  ]);

  const sw = swResult.status === "fulfilled" ? swResult.value : null;
  const sb = sbResult.status === "fulfilled" ? sbResult.value : null;

  const swSteps = sw?.found ? sw.steps : null;
  const sbSteps = sb?.found ? sb.steps : null;

  const progress: StepProgress[] = [
    { key: "logline",       status: boolToStatus(!!swSteps?.logline) },
    { key: "synopsis",      status: boolToStatus(!!swSteps?.synopsis) },
    { key: "treatment",     status: boolToStatus(!!swSteps?.treatment) },
    { key: "script",        status: boolToStatus(!!swSteps?.script) },
    { key: "scene",         status: boolToStatus(!!swSteps?.scenes) },
    { key: "cut",           status: boolToStatus(!!swSteps?.cuts) },
    { key: "image-prompt",  status: boolToStatus(!!sbSteps?.imagePrompt) },
    { key: "video-prompt",  status: boolToStatus(!!sbSteps?.videoPrompt) },
  ];

  return NextResponse.json(progress);
}
