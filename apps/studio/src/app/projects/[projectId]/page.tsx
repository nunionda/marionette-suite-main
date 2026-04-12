import { notFound } from 'next/navigation';
import { fetchProject, fetchScenes } from '@/lib/studio/api';
import { ProgressBar } from '@/components/studio/ProgressBar';
import { RiskMonitor } from '@/components/intelligence/RiskMonitor';
import { ExecuteGraphButton } from '@/components/studio/ExecuteGraphButton';
import Link from 'next/link';
import type { ProjectStatus } from '@/lib/studio/types';

const RISK_STATUS: Record<ProjectStatus, string> = {
  development: 'CAUTION',
  production: 'STABLE',
  post: 'STABLE',
};

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectHubPage({ params }: Props) {
  const { projectId } = await params;
  const [project, sceneData] = await Promise.all([
    fetchProject(projectId),
    fetchScenes(projectId),
  ]);
  if (!project) notFound();

  const { sequences, scenes } = sceneData;
  const isYouTube = project.category === 'youtube_short';

  // Derive risk metrics from project completion data
  const completionRatio = project.totalCuts > 0 ? project.completedCuts / project.totalCuts : 0;
  const riskData = {
    divergenceIndex: Math.max(0, 1 - completionRatio),
    commercialScore: Math.round(completionRatio * 65 + (project.completedScenes / Math.max(project.totalScenes, 1)) * 35),
    status: RISK_STATUS[project.status] ?? 'CAUTION',
    resourceAllocation: { vfx: 0.35, cast: 0.30, marketing: 0.25, contingency: 0.10 },
  };

  if (isYouTube) {
    const YT_SECTION_COLORS: Record<string, string> = {
      HOOK: '#f59e0b', INTRO: '#3b82f6', MAIN: '#8b5cf6', CTA: '#10b981', OUTRO: '#6b7280',
    };
    return (
      <div className="px-8 py-10 max-w-[1200px]">
        <div className="flex justify-end mb-6">
          <ExecuteGraphButton projectId={projectId} />
        </div>

        {/* YouTube stats */}
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '목표 길이', value: '60초' },
            { label: '섹션 수', value: project.totalScenes },
            { label: '완료 섹션', value: project.completedScenes },
            { label: '클립 진행', value: `${project.completedCuts} / ${project.totalCuts}` },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-lg border border-[var(--studio-border)] p-5"
              style={{ background: 'var(--studio-bg-surface)' }}
            >
              <p className="text-[11px] text-[var(--studio-text-dim)] uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-[28px] font-bold text-[var(--studio-text)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div
          className="mb-10 rounded-lg border border-[var(--studio-border)] p-6"
          style={{ background: 'var(--studio-bg-surface)' }}
        >
          <h2 className="text-[14px] font-semibold mb-4">전체 진행률</h2>
          <ProgressBar completed={project.completedCuts} total={project.totalCuts} />
        </div>

        {/* Section cards */}
        <h2 className="text-[14px] font-semibold mb-4">섹션 구성</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {scenes.map(section => {
            const sectionType = section.location; // location 필드에 HOOK/INTRO 등 저장
            const color = YT_SECTION_COLORS[sectionType] ?? '#6b7280';
            return (
              <Link
                key={section.id}
                href={`/projects/${projectId}/scenes`}
                className="rounded-lg border p-4 hover:opacity-80 transition-opacity"
                style={{ background: 'var(--studio-bg-surface)', borderColor: color + '44' }}
              >
                <div
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3"
                  style={{ background: color + '22', color }}
                >
                  {sectionType}
                </div>
                <p className="text-[13px] font-semibold text-[var(--studio-text)] mb-3">{section.title}</p>
                <ProgressBar completed={section.completedCutCount} total={section.cutCount} />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-[1200px]">
      {/* Action bar */}
      <div className="flex justify-end mb-6">
        <ExecuteGraphButton projectId={projectId} />
      </div>

      {/* Project stats */}
      <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '전체 씬', value: project.totalScenes },
          { label: '완료 씬', value: project.completedScenes },
          { label: '전체 컷', value: project.totalCuts.toLocaleString() },
          { label: '완료 컷', value: project.completedCuts.toLocaleString() },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--studio-border)] p-5"
            style={{ background: 'var(--studio-bg-surface)' }}
          >
            <p className="text-[11px] text-[var(--studio-text-dim)] uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="text-[28px] font-bold text-[var(--studio-text)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div
        className="mb-10 rounded-lg border border-[var(--studio-border)] p-6"
        style={{ background: 'var(--studio-bg-surface)' }}
      >
        <h2 className="text-[14px] font-semibold mb-4">전체 진행률</h2>
        <ProgressBar completed={project.completedCuts} total={project.totalCuts} />
      </div>

      {/* Intelligence Audit */}
      <div className="mb-10">
        <RiskMonitor data={riskData} />
      </div>

      {/* Sequence cards */}
      <h2 className="text-[14px] font-semibold mb-4">시퀀스</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sequences.map(seq => (
          <Link
            key={seq.id}
            href={`/projects/${projectId}/scenes?seq=${seq.id}`}
            className="rounded-lg border border-[var(--studio-border)] p-5 hover:border-[var(--studio-border-accent)] transition-colors"
            style={{ background: 'var(--studio-bg-surface)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-[var(--studio-accent)] uppercase tracking-widest">
                Act {seq.number}
              </span>
            </div>
            <p className="text-[15px] font-semibold text-[var(--studio-text)] mb-4">{seq.title}</p>
            <ProgressBar completed={seq.completedSceneCount} total={seq.sceneCount} />
          </Link>
        ))}
      </div>
    </div>
  );
}
