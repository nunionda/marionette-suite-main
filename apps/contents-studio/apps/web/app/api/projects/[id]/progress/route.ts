import { NextResponse } from "next/server";
import type { StepProgress, StepStatus } from "@marionette/ui";
import { GET as libraryProgressGET } from "../../../library/progress/route";
import { GET as postProgressGET } from "../../../post/progress/route";

const SCRIPT_WRITER_API =
  process.env.SCRIPT_WRITER_API_URL ?? (process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006");
const STORYBOARD_API =
  process.env.STORYBOARD_API_URL ?? (process.env.NEXT_PUBLIC_STORYBOARD_URL ?? "http://localhost:3007");

function boolToStatus(done: boolean): StepStatus {
  return done ? "in_progress" : "not_started";
}

async function safeJson(url: string): Promise<unknown> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const enc = encodeURIComponent(id);

  const libraryInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/library/progress?paperclipId=${enc}`);
      const res = await libraryProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const postInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/post/progress?paperclipId=${enc}`);
      const res = await postProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const [sw, sb, ps, cl] = (await Promise.all([
    safeJson(`${SCRIPT_WRITER_API}/api/progress?paperclipId=${enc}`),
    safeJson(`${STORYBOARD_API}/api/progress?paperclipId=${enc}`),
    postInProcess,
    libraryInProcess,
  ])) as [any, any, any, any];

  const swSteps = sw?.found ? sw.steps : null;
  const sbSteps = sb?.found ? sb.steps : null;

  const creativeSteps: StepProgress[] = [
    { key: "logline",       status: boolToStatus(!!swSteps?.logline) },
    { key: "synopsis",      status: boolToStatus(!!swSteps?.synopsis) },
    { key: "treatment",     status: boolToStatus(!!swSteps?.treatment) },
    { key: "script",        status: boolToStatus(!!swSteps?.script) },
    { key: "scene",         status: boolToStatus(!!swSteps?.scenes) },
    { key: "cut",           status: boolToStatus(!!swSteps?.cuts) },
    { key: "image-prompt",  status: boolToStatus(!!sbSteps?.imagePrompt) },
    { key: "video-prompt",  status: boolToStatus(!!sbSteps?.videoPrompt) },
  ];

  const postProduction = ps?.found
    ? {
        paperclipId: ps.paperclipId,
        steps: ps.steps,
        progress: ps.progress,
      }
    : null;

  const distribution = cl?.found
    ? {
        paperclipId: cl.paperclipId,
        published: !!cl.steps?.publish,
        entry: cl.entry ?? null,
      }
    : null;

  return NextResponse.json({
    creativeSteps,
    postProduction,
    distribution,
  });
}
