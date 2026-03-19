"use client";

import { useEffect, useRef, useState } from "react";
import { fetchAPI } from "../../../lib/api";

interface PipelineRun {
  id: string;
  projectId: string;
  projectTitle: string;
  status: string;
  currentStep: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500/20 text-green-400",
  running: "bg-blue-500/20 text-blue-400",
  queued: "bg-yellow-500/20 text-yellow-400",
  failed: "bg-red-500/20 text-red-400",
  idle: "bg-gray-500/20 text-gray-400",
};

export default function PipelinePage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRuns = () => {
    fetchAPI<{ runs: PipelineRun[] }>("/api/pipeline/runs")
      .then((data) => setRuns(data.runs ?? []))
      .catch(() => {
        setRuns([])
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRuns();
    intervalRef.current = setInterval(fetchRuns, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor active and recent pipeline runs
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Loading pipeline runs...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load pipeline runs: {error}
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg">No pipeline runs</p>
          <p className="mt-1 text-sm">
            Start a pipeline from a project to see runs here
          </p>
        </div>
      )}

      <div className="space-y-3">
        {runs.map((run) => (
          <div
            key={run.id}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-medium">{run.projectTitle}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[run.status] ?? statusColors.idle}`}
                >
                  {run.status}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(run.startedAt).toLocaleString()}
              </span>
            </div>

            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">{run.currentStep}</span>
              <span className="text-gray-500">{run.progress}%</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full transition-all ${
                  run.status === "failed" ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${run.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
