import { notFound } from 'next/navigation';
import { fetchProject, fetchScenes } from '@/lib/studio/api';
import { VirtualSceneGrid } from '@/components/studio/VirtualSceneGrid';
import type { SceneMeta } from '@/lib/studio/types';

interface Props {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ seq?: string; status?: string }>;
}

export default async function SceneListPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const { seq, status } = await searchParams;

  const project = await fetchProject(projectId);
  if (!project) notFound();

  const statusFilter = status as SceneMeta['status'] | undefined;
  const { scenes, sequences, totalCount } = await fetchScenes(projectId, {
    sequenceId: seq,
    status: statusFilter,
  });

  const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: '전체' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--studio-text)]">씬 목록</h1>
          <p className="text-[13px] text-[var(--studio-text-dim)] mt-0.5">
            {scenes.length} / {totalCount}씬
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Sequence filter */}
          <div className="flex items-center gap-1 bg-[var(--studio-bg-surface)] border border-[var(--studio-border)] rounded px-1 py-0.5">
            {[{ id: '', title: '전체' }, ...sequences].map(s => (
              <a
                key={s.id}
                href={`?${new URLSearchParams({ ...(s.id && { seq: s.id }), ...(status && { status }) })}`}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                  seq === s.id || (!seq && !s.id)
                    ? 'bg-[var(--studio-accent)] text-white'
                    : 'text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]'
                }`}
              >
                {'number' in s ? `Act ${s.number}` : s.title}
              </a>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[var(--studio-bg-surface)] border border-[var(--studio-border)] rounded px-1 py-0.5">
            {STATUS_OPTIONS.map(opt => (
              <a
                key={opt.value}
                href={`?${new URLSearchParams({ ...(seq && { seq }), ...(opt.value && { status: opt.value }) })}`}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                  (status ?? '') === opt.value
                    ? 'bg-[var(--studio-bg-elevated)] text-[var(--studio-text)]'
                    : 'text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]'
                }`}
              >
                {opt.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual grid */}
      <VirtualSceneGrid scenes={scenes} projectId={projectId} />
    </div>
  );
}
