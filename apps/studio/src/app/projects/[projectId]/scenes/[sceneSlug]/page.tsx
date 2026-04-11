import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProject, fetchSceneDetail, fetchScenes } from '@/lib/studio/api';
import { StatusBadge } from '@/components/studio/StatusBadge';
import { ProgressBar } from '@/components/studio/ProgressBar';
import { CutStrip } from '@/components/studio/CutStrip';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';

interface Props {
  params: Promise<{ projectId: string; sceneSlug: string }>;
}

export default async function SceneDetailPage({ params }: Props) {
  const { projectId, sceneSlug } = await params;

  const [project, scene] = await Promise.all([
    fetchProject(projectId),
    fetchSceneDetail(projectId, sceneSlug),
  ]);

  if (!project || !scene) notFound();

  // Fetch scene list to build prev/next links
  const { scenes } = await fetchScenes(projectId);
  const idx = scenes.findIndex(s => s.slug === sceneSlug);
  const prevScene = idx > 0 ? scenes[idx - 1] : null;
  const nextScene = idx < scenes.length - 1 ? scenes[idx + 1] : null;

  return (
    <div className="px-8 py-8 max-w-[1200px]">
      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between mb-6">
        {prevScene ? (
          <Link
            href={`/projects/${projectId}/scenes/${prevScene.slug}`}
            className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] transition-colors"
          >
            <ChevronLeft size={14} />
            {prevScene.displayId}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/projects/${projectId}/scenes`}
          className="text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] transition-colors"
        >
          씬 목록
        </Link>
        {nextScene ? (
          <Link
            href={`/projects/${projectId}/scenes/${nextScene.slug}`}
            className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] transition-colors"
          >
            {nextScene.displayId}
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Cover + metadata */}
      <div className="flex gap-8 mb-10">
        {/* Cover image */}
        <div
          className="shrink-0 rounded overflow-hidden relative"
          style={{ width: 340, aspectRatio: '16/9', background: 'var(--studio-bg-elevated)' }}
        >
          {scene.coverImageUrl ? (
            <Image
              src={scene.coverImageUrl}
              alt={scene.displayId}
              fill
              className="object-cover"
              sizes="340px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--studio-text-muted)] text-[13px]">
              No cover image
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-[var(--studio-text-dim)]">{scene.displayId}</span>
            <StatusBadge status={scene.status} />
          </div>

          <h1 className="text-[22px] font-bold text-[var(--studio-text)] leading-tight">
            {scene.title}
          </h1>

          {scene.synopsis && (
            <p className="text-[13px] text-[var(--studio-text-dim)] leading-relaxed max-w-xl">
              {scene.synopsis}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-[12px] text-[var(--studio-text-dim)]">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              {scene.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {scene.timeOfDay}
            </span>
            {scene.characters && scene.characters.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users size={12} />
                {scene.characters.join(', ')}
              </span>
            )}
          </div>

          <div className="pt-2 max-w-xs">
            <ProgressBar
              completed={scene.completedCutCount}
              total={scene.cutCount}
            />
          </div>
        </div>
      </div>

      {/* Cut filmstrip */}
      <div>
        <h2 className="text-[14px] font-semibold text-[var(--studio-text)] mb-4">
          컷 목록 <span className="text-[var(--studio-text-dim)] font-normal">({scene.cuts.length})</span>
        </h2>
        <CutStrip cuts={scene.cuts} projectId={projectId} sceneSlug={sceneSlug} />
      </div>
    </div>
  );
}
