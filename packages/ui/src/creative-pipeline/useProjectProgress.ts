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

interface AggregatorResponse {
  creativeSteps: StepProgress[];
  postProduction: PostProductionStatus | null;
  distribution: DistributionStatus | null;
  schedule: ScheduleStatus | null;
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

  return { progress, currentStep, loading, postProduction, distribution, schedule };
}
