import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/studio/types';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface Props {
  project: Project;
}

const STATUS_MAP: Record<Project['status'], string> = {
  development: 'Development',
  production: 'Production',
  post: 'Post',
};

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative rounded-lg overflow-hidden border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] transition-all duration-300 hover:border-[var(--studio-border-accent)] hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-[var(--studio-bg-elevated)] overflow-hidden">
        <Image
          src={project.posterUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={project.status === 'production' ? 'in_progress' : project.status === 'post' ? 'done' : 'pending'} />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Initials badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[var(--studio-accent)] text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">
          {project.initials}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[var(--studio-text)] font-semibold text-[14px] leading-tight">{project.title}</p>
          {project.titleKo && (
            <p className="text-[var(--studio-text-dim)] text-[12px] mt-0.5">{project.titleKo}</p>
          )}
        </div>
        <div className="space-y-2">
          <ProgressBar
            completed={project.completedScenes}
            total={project.totalScenes}
            showLabel={false}
          />
          <p className="text-[11px] text-[var(--studio-text-dim)]">
            {project.completedCuts.toLocaleString()} / {project.totalCuts.toLocaleString()} cuts
          </p>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--studio-text-muted)]">
          {STATUS_MAP[project.status]}
        </p>
      </div>
    </Link>
  );
}
