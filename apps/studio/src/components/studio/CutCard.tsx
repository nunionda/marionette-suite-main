import Link from 'next/link';
import Image from 'next/image';
import type { CutMeta } from '@/lib/studio/types';
import { StatusBadge } from './StatusBadge';

interface Props {
  cut: CutMeta;
  projectId: string;
  sceneSlug: string;
}

export function CutCard({ cut, projectId, sceneSlug }: Props) {
  return (
    <Link
      href={`/projects/${projectId}/scenes/${sceneSlug}/cuts/${cut.slug}`}
      className="group shrink-0 rounded border border-[var(--studio-border)] overflow-hidden hover:border-[var(--studio-border-accent)] transition-colors"
      style={{ width: 180, background: 'var(--studio-bg-surface)' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--studio-bg-elevated)] overflow-hidden">
        {cut.thumbnailUrl ? (
          <Image
            src={cut.thumbnailUrl}
            alt={cut.displayId}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="180px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--studio-text-muted)] text-[10px]">
            No image
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {cut.duration}s
        </div>

        {/* Status */}
        <div className="absolute top-1 right-1">
          <StatusBadge status={cut.status} />
        </div>
      </div>

      {/* Info */}
      <div className="px-2 py-1.5 space-y-0.5">
        <p className="text-[10px] font-mono text-[var(--studio-text-dim)]">{cut.displayId}</p>
        {cut.description && (
          <p className="text-[10px] text-[var(--studio-text-muted)] truncate">{cut.description}</p>
        )}
      </div>
    </Link>
  );
}
