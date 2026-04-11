'use client';

import { useTransition } from 'react';
import { executeGraph } from '@/actions/projects';

interface Props {
  projectId: string;
}

export function ExecuteGraphButton({ projectId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleExecute() {
    startTransition(async () => {
      try {
        await executeGraph(projectId);
      } catch (err) {
        console.error('그래프 실행 실패:', err);
      }
    });
  }

  return (
    <button
      onClick={handleExecute}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'var(--studio-bg-surface)',
        border: '1px solid var(--studio-border)',
        color: 'var(--studio-text)',
      }}
    >
      <span>{isPending ? '실행 중...' : '노드 그래프 실행'}</span>
    </button>
  );
}
