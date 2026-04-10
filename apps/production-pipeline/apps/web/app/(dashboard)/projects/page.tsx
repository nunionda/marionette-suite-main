"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAPI } from "../../../lib/api";
import { STATUS_COLORS, STATUS_LABELS } from "../../../lib/constants";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { SkeletonCard } from "../../../components/ui/Skeleton";

interface Project {
  id: string;
  title: string;
  genre: string;
  status: string;
  progress: number;
  logline?: string;
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
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-semibold group-hover:text-white">
                {project.title}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="mb-4 text-sm text-gray-400">{project.genre}</p>
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
        ))}
      </div>
    </div>
  );
}
