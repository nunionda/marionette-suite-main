/**
 * 6-Phase project flow — rolls up Charter v2.0's 73 processes into the
 * top-level phases that users actually think in.
 *
 * The aggregator at /api/projects/[id]/progress returns ~15 legs. Each
 * phase below maps to 1-5 legs, and the phase's overall progress is the
 * arithmetic mean of its legs' `progress` values (0..1). Legs that
 * report `found: false` contribute 0.
 *
 * Note: cinema + marketing NEW engines (Sprint 13) are not yet wired
 * into the aggregator — when their progress emitters land (a future
 * sprint), they'll surface in the Production phase automatically via
 * the `engineLegs` field.
 */
export interface PhaseDef {
  id: string;
  label: string;
  /** Leg keys in the aggregator response that feed this phase. */
  legs: string[];
  /** Representative route the phase pill links to when clicked. */
  representativeHref: (projectId: string) => string;
  /**
   * Pathname-prefix check for active-phase highlighting. First match wins
   * in top-to-bottom order, so the ordering below also acts as priority.
   */
  pathPrefix: (projectId: string) => string[];
  /** Very short description for tooltip. */
  description: string;
}

export const PHASES: PhaseDef[] = [
  {
    id: "script",
    label: "Script",
    legs: ["creativeSteps"],
    representativeHref: (id) => `/projects/${id}/screenplay`,
    pathPrefix: (id) => [
      `/projects/${id}/screenplay`,
      `/projects/${id}/elements`, // character design lives here
    ],
    description: "Logline → outline → screenplay → breakdown → shot list",
  },
  {
    id: "preprod",
    label: "Pre-prod",
    legs: ["schedule", "budget", "casting", "locations", "rehearsals"],
    representativeHref: () => `/schedule`,
    pathPrefix: () => [
      "/schedule",
      "/budget",
      "/casting",
      "/locations",
      "/rehearsals",
    ],
    description: "Schedule, budget, casting, locations, rehearsals",
  },
  {
    id: "production",
    label: "Production",
    legs: ["ingest"],
    representativeHref: (id) => `/projects/${id}/cinema`,
    pathPrefix: (id) => [
      `/projects/${id}/cinema`,
      `/projects/${id}/marketing`,
      `/ingest`,
    ],
    description:
      "Cinema Studio (AI shots) · Marketing Studio (ad variants) · Data ingest",
  },
  {
    id: "post",
    label: "Post",
    legs: ["postProduction", "titles", "assembly"],
    representativeHref: () => `/post`,
    pathPrefix: () => ["/post", "/titles", "/assembly"],
    description: "Assembly, VFX, sound, color, titles, final mix",
  },
  {
    id: "distribute",
    label: "Distribute",
    legs: ["distribution", "festivals", "marketing"],
    representativeHref: () => `/festivals`,
    pathPrefix: () => [
      "/festivals",
      "/library",
      "/marketing", // /marketing hub route (ops), not the project-scoped one
    ],
    description: "Festivals, streaming/VOD, marketing ops, content library",
  },
  {
    id: "analytics",
    label: "Analytics",
    legs: ["boxOffice", "reviews"],
    representativeHref: () => `/boxoffice`,
    pathPrefix: () => ["/boxoffice", "/reviews"],
    description: "Box office, reviews, post-release analytics",
  },
];

/**
 * Roll up aggregator response into per-phase progress.
 *
 * The aggregator is heterogeneous — each leg was built at a different time
 * and has its own shape. We handle four observed patterns:
 *
 *   1. Array of { status }         — e.g. creativeSteps (Charter nodes).
 *                                     Progress = count(status != "not_started") / total
 *   2. Object with `steps: {a: bool, b: bool, ...}` — e.g. schedule, post,
 *                                     casting, etc. Progress = count(true) / count(total)
 *   3. Object with numeric `progress` or `percent` field — normalized 0..1
 *   4. Object that exists but doesn't match any of the above — counted as
 *                                     "present but unquantified" → 0.5
 *
 * Null / undefined / missing legs are skipped (don't penalize absence).
 */
export interface PhaseRollup {
  phaseId: string;
  /** 0..1 arithmetic mean across legs present in the response. */
  progress: number;
  /** How many legs in this phase have usable data. */
  activeLegCount: number;
  /** Total legs declared for this phase. */
  totalLegCount: number;
}

interface LegLike {
  found?: boolean;
  progress?: number | Record<string, unknown>;
  percent?: number;
  steps?: Record<string, unknown>;
  status?: string;
}

/** Returns undefined when the leg should not contribute. */
function legProgress(leg: unknown): number | undefined {
  if (leg == null) return undefined;

  // Pattern 1: array of {status}
  if (Array.isArray(leg)) {
    if (leg.length === 0) return 0;
    const started = leg.filter(
      (x) =>
        typeof x === "object" &&
        x !== null &&
        "status" in x &&
        (x as { status: string }).status !== "not_started",
    ).length;
    return started / leg.length;
  }

  if (typeof leg !== "object") return undefined;
  const l = leg as LegLike;

  // Explicitly marked "not found"
  if (l.found === false) return undefined;

  // Pattern 2: object with steps map of booleans
  if (l.steps && typeof l.steps === "object") {
    const entries = Object.values(l.steps);
    if (entries.length > 0 && entries.every((v) => typeof v === "boolean")) {
      const truthy = entries.filter((v) => v === true).length;
      return truthy / entries.length;
    }
  }

  // Pattern 3: numeric progress
  if (typeof l.progress === "number") {
    return l.progress > 1 ? l.progress / 100 : l.progress;
  }
  if (typeof l.percent === "number") {
    return l.percent > 1 ? l.percent / 100 : l.percent;
  }

  // Pattern 4: present but unquantified
  return 0.5;
}

export function rollupPhases(
  aggregatorResponse: Record<string, unknown>,
): PhaseRollup[] {
  return PHASES.map((phase) => {
    let sum = 0;
    let activeCount = 0;
    for (const legKey of phase.legs) {
      const p = legProgress(aggregatorResponse[legKey]);
      if (p === undefined) continue;
      activeCount++;
      sum += p;
    }
    const progress = activeCount === 0 ? 0 : sum / activeCount;
    return {
      phaseId: phase.id,
      progress: Math.max(0, Math.min(1, progress)),
      activeLegCount: activeCount,
      totalLegCount: phase.legs.length,
    };
  });
}

/** Find first incomplete phase — useful for "next step" callout. */
export function nextIncompletePhase(
  rollups: PhaseRollup[],
): PhaseRollup | undefined {
  return rollups.find((r) => r.progress < 1);
}

/** Determine which phase matches a given pathname. */
export function phaseFromPathname(
  pathname: string,
  projectId: string,
): PhaseDef | undefined {
  for (const phase of PHASES) {
    const prefixes = phase.pathPrefix(projectId);
    if (prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return phase;
    }
  }
  return undefined;
}
