"use client";

import { useEffect, useState } from "react";
import type { StepProgress, StepKey } from "./types";
import { STEPS } from "./types";

export interface PostProductionStatus {
  paperclipId: string;
  steps: {
    edit: boolean;
    vfx: boolean;
    sound: boolean;
    color: boolean;
    delivery: boolean;
  };
  progress: {
    edit: number;
    vfx: { done: number; total: number };
    sound: { done: number; total: number };
    color: { done: number; total: number };
  };
}

export interface DistributionStatus {
  paperclipId: string;
  published: boolean;
  entry: {
    id: string;
    title: string;
    channels: string[];
    deliverables: string[];
    releaseDate?: string;
  } | null;
}

export interface ScheduleStatus {
  paperclipId: string;
  steps: {
    scheduled: boolean;
    shooting: boolean;
    wrapped: boolean;
  };
  progress: {
    totalDays: number;
    wrappedDays: number;
    inProgressDays: number;
    scheduledDays: number;
  };
  nextDay: {
    id: string;
    day: number;
    date: string;
    location: string;
    interior: boolean;
    callTime: string;
    wrapTime: string;
  } | null;
  activeDay: ScheduleStatus["nextDay"];
}

export interface BudgetStatus {
  paperclipId: string;
  steps: {
    drafted: boolean;
    approved: boolean;
  };
  status: "draft" | "submitted" | "approved" | "locked";
  totalAllocated: number;
  currency: "KRW";
  summary: {
    spent: number;
    remaining: number;
    burnRatePct: number;
  };
  departments: Array<{
    department: string;
    allocated: number;
    spent: number;
  }>;
}

export interface CastingStatus {
  paperclipId: string;
  steps: {
    started: boolean;
    auditioning: boolean;
    locked: boolean;
  };
  summary: {
    total: number;
    signed: number;
    auditioning: number;
    open: number;
  };
  leads: Array<{
    characterName: string;
    actorName: string | null;
    state: "open" | "audition" | "offer" | "confirmed" | "signed";
  }>;
}

export interface LocationsStatus {
  paperclipId: string;
  steps: {
    scouting: boolean;
    permitted: boolean;
    locked: boolean;
  };
  summary: {
    total: number;
    confirmed: number;
    permitted: number;
    scouting: number;
  };
  topLocations: Array<{
    name: string;
    interior: boolean;
    status: "scouting" | "shortlisted" | "permitted" | "confirmed" | "rejected";
  }>;
}

export interface RehearsalsStatus {
  paperclipId: string;
  steps: {
    scheduled: boolean;
    started: boolean;
    done: boolean;
  };
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
    totalHours: number;
  };
  next: {
    id: string;
    date: string;
    type: string;
    venue: string;
    durationHours: number;
    attendees: string[];
  } | null;
  active: RehearsalsStatus["next"];
}

export interface IngestStatus {
  paperclipId: string;
  steps: {
    ingesting: boolean;
    verified: boolean;
    archived: boolean;
  };
  summary: {
    total: number;
    verified: number;
    ingesting: number;
    totalSizeGB: number;
    totalTakes: number;
    archived: number;
  };
  latestBatch: {
    shootDate: string;
    cameraRoll: string;
    cameraModel: string;
    codec: string;
    sizeGB: number;
    takes: number;
  } | null;
}

export interface TitlesStatus {
  paperclipId: string;
  steps: {
    drafted: boolean;
    inReview: boolean;
    approved: boolean;
  };
  summary: {
    total: number;
    approved: number;
    review: number;
    draft: number;
  };
  mainTitle: {
    text: string | null;
    font: string | null;
    durationSec: number | null;
    status: "draft" | "review" | "approved" | "locked";
  } | null;
}

interface AggregatorResponse {
  creativeSteps: StepProgress[];
  postProduction: PostProductionStatus | null;
  distribution: DistributionStatus | null;
  schedule: ScheduleStatus | null;
  budget: BudgetStatus | null;
  casting: CastingStatus | null;
  locations: LocationsStatus | null;
  rehearsals: RehearsalsStatus | null;
  ingest: IngestStatus | null;
  titles: TitlesStatus | null;
}

/**
 * Fetches progress for all 8 creative steps plus post-production and
 * distribution status. Returns all-empty defaults on failure.
 */
export function useProjectProgress(projectId: string) {
  const [progress, setProgress] = useState<StepProgress[]>(
    STEPS.map((s) => ({ key: s.key, status: "not_started" })),
  );
  const [postProduction, setPostProduction] =
    useState<PostProductionStatus | null>(null);
  const [distribution, setDistribution] = useState<DistributionStatus | null>(
    null,
  );
  const [schedule, setSchedule] = useState<ScheduleStatus | null>(null);
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [casting, setCasting] = useState<CastingStatus | null>(null);
  const [locations, setLocations] = useState<LocationsStatus | null>(null);
  const [rehearsals, setRehearsals] = useState<RehearsalsStatus | null>(null);
  const [ingest, setIngest] = useState<IngestStatus | null>(null);
  const [titles, setTitles] = useState<TitlesStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/progress`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AggregatorResponse;
        if (!cancelled) {
          setProgress(data.creativeSteps);
          setPostProduction(data.postProduction);
          setDistribution(data.distribution);
          setSchedule(data.schedule);
          setBudget(data.budget);
          setCasting(data.casting);
          setLocations(data.locations);
          setRehearsals(data.rehearsals);
          setIngest(data.ingest);
          setTitles(data.titles);
        }
      } catch {
        // Silent fail: keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const currentStep: StepKey | undefined = progress.find(
    (p) => p.status === "in_progress" || p.status === "review",
  )?.key;

  return { progress, currentStep, loading, postProduction, distribution, schedule, budget, casting, locations, rehearsals, ingest, titles };
}
