import { NextResponse } from "next/server";
import type { StepProgress, StepStatus } from "@marionette/ui/creative-pipeline";
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
import { GET as boxOfficeProgressGET } from "../../../boxoffice/progress/route";
import { GET as reviewsProgressGET } from "../../../reviews/progress/route";
import { GET as assemblyProgressGET } from "../../../assembly/progress/route";
import { GET as cinemaEngineProgressGET } from "../../../cinema/progress/route";
import { GET as marketingEngineProgressGET } from "../../../marketing/campaigns/progress/route";
import { GET as ideaProgressGET } from "../../../idea/progress/route";
import { GET as researchProgressGET } from "../../../research/progress/route";
import { GET as rightsProgressGET } from "../../../rights/progress/route";
import { GET as pitchProgressGET } from "../../../pitch/progress/route";
import { GET as financingProgressGET } from "../../../financing/progress/route";
import { GET as contractsProgressGET } from "../../../contracts/progress/route";
import { GET as talentContractsProgressGET } from "../../../talent-contracts/progress/route";
import { GET as crewProgressGET } from "../../../crew/progress/route";
import { GET as equipmentProgressGET } from "../../../equipment/progress/route";
import { GET as insuranceProgressGET } from "../../../insurance/progress/route";
import { GET as productionOfficeProgressGET } from "../../../production-office/progress/route";

const SCRIPT_WRITER_API =
  process.env.SCRIPT_WRITER_API_URL ?? (process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006");
const STORYBOARD_API =
  process.env.STORYBOARD_API_URL ?? (process.env.NEXT_PUBLIC_STORYBOARD_URL ?? "http://localhost:3007");

function boolToStatus(done: boolean): StepStatus {
  return done ? "in_progress" : "not_started";
}

/**
 * Fetch external spoke progress with a hard timeout.
 *
 * Why the timeout: aggregator fans out to script-writer (:3006) and
 * storyboard (:3007). If either spoke is unreachable-but-accepting-connections
 * (stale process, network partition, k8s readiness blip), a bare `fetch` hangs
 * forever and the hub's project dashboard never renders. 5s is long enough for
 * dev-mode cold responses and short enough that a single unhealthy spoke can't
 * take down the entire page.
 */
const EXTERNAL_FETCH_TIMEOUT_MS = 5000;

async function safeJson(url: string): Promise<unknown> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS) });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const enc = encodeURIComponent(id);

  // Forward the session cookie so Sprint 19 auth-guarded routes accept the
  // internal synthetic requests made below.
  const cookieHeader = req.headers.get("cookie") ?? "";

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

  const boxOfficeInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/boxoffice/progress?paperclipId=${enc}`);
      const res = await boxOfficeProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const reviewsInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/reviews/progress?paperclipId=${enc}`);
      const res = await reviewsProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const assemblyInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/assembly/progress?paperclipId=${enc}`);
      const res = await assemblyProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const cinemaEngineInProcess = (async () => {
    try {
      const req = new Request(
        `http://internal/api/cinema/progress?projectId=${enc}`,
      );
      const res = await cinemaEngineProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const marketingEngineInProcess = (async () => {
    try {
      const req = new Request(
        `http://internal/api/marketing/campaigns/progress?projectId=${enc}`,
      );
      const res = await marketingEngineProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  // Sprint 19 routes require a valid session cookie — forward it from the
  // outer request so these internal synthetic calls pass auth.
  const authHeaders = cookieHeader ? { cookie: cookieHeader } : undefined;

  const ideaInProcess = (async () => {
    try {
      const r = new Request(`http://internal/api/idea/progress?paperclipId=${enc}`, { headers: authHeaders });
      const res = await ideaProgressGET(r);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const researchInProcess = (async () => {
    try {
      const r = new Request(`http://internal/api/research/progress?paperclipId=${enc}`, { headers: authHeaders });
      const res = await researchProgressGET(r);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const rightsInProcess = (async () => {
    try {
      const r = new Request(`http://internal/api/rights/progress?paperclipId=${enc}`, { headers: authHeaders });
      const res = await rightsProgressGET(r);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const pitchInProcess = (async () => {
    try {
      const r = new Request(`http://internal/api/pitch/progress?paperclipId=${enc}`, { headers: authHeaders });
      const res = await pitchProgressGET(r);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const financingInProcess = (async () => {
    try {
      const r = new Request(`http://internal/api/financing/progress?paperclipId=${enc}`, { headers: authHeaders });
      const res = await financingProgressGET(r);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const contractsInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/contracts/progress?paperclipId=${enc}`);
      const res = await contractsProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const talentContractsInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/talent-contracts/progress?paperclipId=${enc}`);
      const res = await talentContractsProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const crewInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/crew/progress?paperclipId=${enc}`);
      const res = await crewProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const equipmentInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/equipment/progress?paperclipId=${enc}`);
      const res = await equipmentProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const insuranceInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/insurance/progress?paperclipId=${enc}`);
      const res = await insuranceProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const productionOfficeInProcess = (async () => {
    try {
      const req = new Request(`http://internal/api/production-office/progress?paperclipId=${enc}`);
      const res = await productionOfficeProgressGET(req);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  })();

  const [sw, sb, ps, cl, sc, bg, ct, lc, rh, ig, tl, fs, mk, bx, rv, asm, cin, mkt, ideaData, rs, rt, pt, fn, con, tc, cw, eq, ins, po] = (await Promise.all([
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
    boxOfficeInProcess,
    reviewsInProcess,
    assemblyInProcess,
    cinemaEngineInProcess,
    marketingEngineInProcess,
    ideaInProcess,
    researchInProcess,
    rightsInProcess,
    pitchInProcess,
    financingInProcess,
    contractsInProcess,
    talentContractsInProcess,
    crewInProcess,
    equipmentInProcess,
    insuranceInProcess,
    productionOfficeInProcess,
  ])) as [any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any];

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
        streaming: cl.streaming ?? null,
        streamingScheduled: !!cl.steps?.streamingScheduled,
        streamingLive: !!cl.steps?.streamingLive,
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

  const boxOffice = bx?.found
    ? {
        paperclipId: bx.paperclipId,
        steps: bx.steps,
        summary: bx.summary,
        meta: bx.meta,
        latestWeek: bx.latestWeek,
      }
    : null;

  const reviews = rv?.found
    ? {
        paperclipId: rv.paperclipId,
        steps: rv.steps,
        summary: rv.summary,
        topReview: rv.topReview,
      }
    : null;

  const assembly = asm?.found
    ? {
        paperclipId: asm.paperclipId,
        steps: asm.steps,
        summary: asm.summary,
        latestJob: asm.latestJob,
      }
    : null;

  const cinemaEngine = cin?.found
    ? {
        paperclipId: cin.paperclipId,
        steps: cin.steps,
        summary: cin.summary,
        totalUsages: cin.totalUsages,
        distinctNodeIds: cin.distinctNodeIds,
      }
    : null;

  const marketingEngine = mkt?.found
    ? {
        paperclipId: mkt.paperclipId,
        steps: mkt.steps,
        summary: mkt.summary,
        totalUsages: mkt.totalUsages,
        distinctNodeIds: mkt.distinctNodeIds,
      }
    : null;

  const idea = ideaData?.found
    ? {
        paperclipId: ideaData.paperclipId,
        steps: ideaData.steps,
        status: ideaData.status,
        format: ideaData.format,
        genre: ideaData.genre,
        logline: ideaData.logline,
      }
    : null;

  const research = rs?.found
    ? {
        paperclipId: rs.paperclipId,
        steps: rs.steps,
        overallStatus: rs.overallStatus,
        completedCategories: rs.completedCategories,
        totalCategories: rs.totalCategories,
        marketSize: rs.marketSize,
      }
    : null;

  const rights = rt?.found
    ? {
        paperclipId: rt.paperclipId,
        steps: rt.steps,
        overallStatus: rt.overallStatus,
        hasIssues: rt.hasIssues,
        allClear: rt.allClear,
        legalCounsel: rt.legalCounsel,
      }
    : null;

  const pitch = pt?.found
    ? {
        paperclipId: pt.paperclipId,
        steps: pt.steps,
        status: pt.status,
        deckVersion: pt.deckVersion,
        meetingCount: pt.meetingCount,
        interestedCount: pt.interestedCount,
        askAmount: pt.askAmount,
      }
    : null;

  const financing = fn?.found
    ? {
        paperclipId: fn.paperclipId,
        steps: fn.steps,
        status: fn.status,
        totalBudget: fn.totalBudget,
        totalRaised: fn.totalRaised,
        raisedPercent: fn.raisedPercent,
        greenlitDate: fn.greenlitDate,
      }
    : null;

  const contracts = con?.found
    ? {
        paperclipId: con.paperclipId,
        steps: con.steps,
        summary: con.summary,
        topContracts: con.topContracts,
      }
    : null;

  const talentContracts = tc?.found
    ? {
        paperclipId: tc.paperclipId,
        steps: tc.steps,
        summary: tc.summary,
        leads: tc.leads,
      }
    : null;

  const crew = cw?.found
    ? {
        paperclipId: cw.paperclipId,
        steps: cw.steps,
        summary: cw.summary,
        departments: cw.departments,
      }
    : null;

  const equipment = eq?.found
    ? {
        paperclipId: eq.paperclipId,
        steps: eq.steps,
        summary: eq.summary,
        categories: eq.categories,
      }
    : null;

  const insurance = ins?.found
    ? {
        paperclipId: ins.paperclipId,
        steps: ins.steps,
        summary: ins.summary,
        policyTypes: ins.policyTypes,
      }
    : null;

  const productionOffice = po?.found
    ? {
        paperclipId: po.paperclipId,
        steps: po.steps,
        summary: po.summary,
        categories: po.categories,
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
    boxOffice,
    reviews,
    cinemaEngine,
    marketingEngine,
    assembly,
    idea,
    research,
    rights,
    pitch,
    financing,
    contracts,
    talentContracts,
    crew,
    equipment,
    insurance,
    productionOffice,
  });
}
