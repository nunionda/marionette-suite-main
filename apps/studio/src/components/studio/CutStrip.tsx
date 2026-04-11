'use client';

import type { CutMeta } from '@/lib/studio/types';
import { CutCard } from './CutCard';

interface Props {
  cuts: CutMeta[];
  projectId: string;
  sceneSlug: string;
}

export function CutStrip({ cuts, projectId, sceneSlug }: Props) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory"
      style={{ scrollbarColor: 'var(--studio-border) transparent' }}
    >
      {cuts.map(cut => (
        <div key={cut.id} className="snap-start">
          <CutCard cut={cut} projectId={projectId} sceneSlug={sceneSlug} />
        </div>
      ))}
    </div>
  );
}
