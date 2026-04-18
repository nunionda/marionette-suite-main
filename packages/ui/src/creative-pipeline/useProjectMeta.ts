"use client";

import { useEffect, useState } from "react";
import type { ProjectMeta } from "./types";

/**
 * Fetches project metadata from a /api/projects/[id] endpoint.
 * Server component caller is preferred; this hook is a client-side fallback.
 */
export function useProjectMeta(projectId: string, initial?: ProjectMeta) {
  const [meta, setMeta] = useState<ProjectMeta | undefined>(initial);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ProjectMeta;
        if (!cancelled) setMeta(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, initial]);

  return { meta, error };
}
