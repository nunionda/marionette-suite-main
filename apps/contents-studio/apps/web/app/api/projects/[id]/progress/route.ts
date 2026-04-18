import { NextResponse } from "next/server";
import type { StepProgress, StepStatus } from "@marionette/ui";
import { GET as libraryProgressGET } from "../../../library/progress/route";
import { GET as postProgressGET } from "../../../post/progress/route";
import { GET as scheduleProgressGET } from "../../../schedule/progress/route";
import { GET as budgetProgressGET } from "../../../budget/progress/route";
import { GET as castingProgressGET } from "../../../casting/progress/route";
import { GET as locationsProgressGET } from "../../../locations/progress/route";
import { GET as rehearsalsProgressGET } from "../../../rehearsals/progress/route";
import { GET as ingestProgressGET } from "../../../ingest/progress/route";
import { GET as titlesProgressGET } from "../../../titles/progress/route";
import { GET as festivalsProgressGET } from "../../../festivals/progress/route";
import { GET as marketingProgressGET } from "../../../marketing/progress/route";

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

  const scheduleInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/schedule/progress?paperclipId=${enc}`);
      const res = await scheduleProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const budgetInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/budget/progress?paperclipId=${enc}`);
      const res = await budgetProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const castingInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/casting/progress?paperclipId=${enc}`);
      const res = await castingProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const locationsInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/locations/progress?paperclipId=${enc}`);
      const res = await locationsProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const rehearsalsInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/rehearsals/progress?paperclipId=${enc}`);
      const res = await rehearsalsProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const ingestInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/ingest/progress?paperclipId=${enc}`);
      const res = await ingestProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const titlesInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/titles/progress?paperclipId=${enc}`);
      const res = await titlesProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const festivalsInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/festivals/progress?paperclipId=${enc}`);
      const res = await festivalsProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const marketingInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/marketing/progress?paperclipId=${enc}`);
      const res = await marketingProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const [sw, sb, ps, cl, sc, bg, ct, lc, rh, ig, tl, fs, mk] = (await Promise.all([
    safeJson(`${SCRIPT_WRITER_API}/api/progress?paperclipId=${enc}`),
    safeJson(`${STORYBOARD_API}/api/progress?paperclipId=${enc}`),
    postInProcess,
    libraryInProcess,
    scheduleInProcess,
    budgetInProcess,
    castingInProcess,
    locationsInProcess,
    rehearsalsInProcess,
    ingestInProcess,
    titlesInProcess,
    festivalsInProcess,
    marketingInProcess,
  ])) as [any, any, any, any, any, any, any, any, any, any, any, any, any];

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

  const schedule = sc?.found
    ? {
        paperclipId: sc.paperclipId,
        steps: sc.steps,
        progress: sc.progress,
        nextDay: sc.nextDay,
        activeDay: sc.activeDay,
      }
    : null;

  const budget = bg?.found
    ? {
        paperclipId: bg.paperclipId,
        steps: bg.steps,
        status: bg.status,
        totalAllocated: bg.totalAllocated,
        currency: bg.currency,
        summary: bg.summary,
        departments: bg.departments,
      }
    : null;

  const casting = ct?.found
    ? {
        paperclipId: ct.paperclipId,
        steps: ct.steps,
        summary: ct.summary,
        leads: ct.leads,
      }
    : null;

  const locations = lc?.found
    ? {
        paperclipId: lc.paperclipId,
        steps: lc.steps,
        summary: lc.summary,
        topLocations: lc.topLocations,
      }
    : null;

  const rehearsals = rh?.found
    ? {
        paperclipId: rh.paperclipId,
        steps: rh.steps,
        summary: rh.summary,
        next: rh.next,
        active: rh.active,
      }
    : null;

  const ingest = ig?.found
    ? {
        paperclipId: ig.paperclipId,
        steps: ig.steps,
        summary: ig.summary,
        latestBatch: ig.latestBatch
          ? {
              shootDate: ig.latestBatch.shootDate,
              cameraRoll: ig.latestBatch.cameraRoll,
              cameraModel: ig.latestBatch.cameraModel,
              codec: ig.latestBatch.codec,
              sizeGB: ig.latestBatch.sizeGB,
              takes: ig.latestBatch.takes,
            }
          : null,
      }
    : null;

  const titles = tl?.found
    ? {
        paperclipId: tl.paperclipId,
        steps: tl.steps,
        summary: tl.summary,
        mainTitle: tl.mainTitle,
      }
    : null;

  const festivals = fs?.found
    ? {
        paperclipId: fs.paperclipId,
        steps: fs.steps,
        summary: fs.summary,
        nextDeadline: fs.nextDeadline,
      }
    : null;

  const marketing = mk?.found
    ? {
        paperclipId: mk.paperclipId,
        steps: mk.steps,
        summary: mk.summary,
        flagship: mk.flagship,
      }
    : null;

  return NextResponse.json({
    creativeSteps,
    postProduction,
    distribution,
    schedule,
    budget,
    casting,
    locations,
    rehearsals,
    ingest,
    titles,
    festivals,
    marketing,
  });
}
