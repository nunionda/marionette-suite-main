"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ContentCategory, StudioCode } from "@marionette/pipeline-core";
import { fetchAPI } from "../../../lib/api";
import { STATUS_COLORS, STATUS_LABELS } from "../../../lib/constants";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { CategoryBadge, StudioBadge, PhaseBadge } from "../../../components/ui/CategoryBadge";

interface Project {
  id: string;
  title: string;
  genre: string;
  status: string;
  progress: number;
  logline?: string;
  category?: ContentCategory;
  studio?: StudioCode;
}

/** Mock inferrer until API returns category/studio. Based on title keywords. */
function inferCategory(p: Project): ContentCategory {
  if (p.category) return p.category;
  const t = `${p.title} ${p.genre}`.toLowerCase();
  if (/(광고|cm|commercial|brand|nike|제품)/.test(t)) return "commercial";
  if (/(드라마|drama|시즌|episode|ott)/.test(t)) return "drama";
  if (/(유튜브|youtube|shorts|브이로그|vlog)/.test(t)) return "youtube";
  return "film";
}
function inferStudio(p: Project): StudioCode {
  if (p.studio) return p.studio;
  const t = p.title.toLowerCase();
  if (/(nike|limitless|광고)/.test(t)) return "STE";
  return "STE";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAPI<{ projects: Project[] }>("/api/projects")
      .then((data) => setProjects(data.projects))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage your AI film production projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/projects/brainstorm"
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:from-amber-600 hover:to-orange-600"
          >
            💡 Brainstorm
          </Link>
          <Link
            href="/projects/new"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-400 transition hover:border-gray-500 hover:text-white"
          >
            + New Project
          </Link>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load projects: {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg">No projects yet</p>
          <p className="mt-1 text-sm">Create your first project to get started</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const category = inferCategory(project);
          const studio = inferStudio(project);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
            >
              <div className="mb-2 flex items-center gap-2">
                <CategoryBadge category={category} />
                <StudioBadge studio={studio} />
              </div>
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold group-hover:text-white">
                  {project.title}
                </h3>
                <StatusBadge status={project.status} />
              </div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gray-400">{project.genre || "—"}</p>
                <PhaseBadge category={category} />
              </div>
              {project.logline && (
                <p className="mb-4 line-clamp-2 text-xs text-gray-500">{project.logline}</p>
              )}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-gray-500">
                {project.progress}%
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
