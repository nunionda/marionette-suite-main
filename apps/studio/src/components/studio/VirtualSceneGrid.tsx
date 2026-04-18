'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SceneMeta } from '@/lib/studio/types';
import { SceneCard } from './SceneCard';

const COLUMNS = 4;
const CARD_HEIGHT = 220; // px estimate per card row
const GAP = 16;

interface Props {
  scenes: SceneMeta[];
  projectId: string;
}

export function VirtualSceneGrid({ scenes, projectId }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Group scenes into rows of 4
  const rows: SceneMeta[][] = [];
  for (let i = 0; i < scenes.length; i += COLUMNS) {
    rows.push(scenes.slice(i, i + COLUMNS));
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: 'calc(100vh - var(--studio-nav-h) - 120px)' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
                gap: GAP,
              }}
            >
              {row.map(scene => (
                <SceneCard key={scene.id} scene={scene} projectId={projectId} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
