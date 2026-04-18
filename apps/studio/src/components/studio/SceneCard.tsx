import Link from 'next/link';
import Image from 'next/image';
import type { SceneMeta } from '@/lib/studio/types';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface Props {
  scene: SceneMeta;
  projectId: string;
}

export function SceneCard({ scene, projectId }: Props) {
  return (
    <Link
      href={`/projects/${projectId}/scenes/${scene.slug}`}
      className="group rounded border border-[var(--studio-border)] overflow-hidden hover:border-[var(--studio-border-accent)] transition-colors"
      style={{ background: 'var(--studio-bg-surface)' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--studio-bg-elevated)] overflow-hidden">
        {scene.coverImageUrl ? (
          <Image
            src={scene.coverImageUrl}
            alt={scene.displayId}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--studio-text-muted)] text-[11px]">
            No image
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <StatusBadge status={scene.status} />
        </div>
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {scene.displayId}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-[12px] font-semibold text-[var(--studio-text)] truncate">{scene.title}</p>
        <p className="text-[10px] text-[var(--studio-text-dim)]">
          {scene.location} · {scene.timeOfDay}
        </p>
        <ProgressBar
          completed={scene.completedCutCount}
          total={scene.cutCount}
          showLabel={false}
          className="mt-1"
        />
        <p className="text-[10px] text-[var(--studio-text-dim)]">
          {scene.completedCutCount}/{scene.cutCount} cuts
        </p>
      </div>
    </Link>
  );
}
