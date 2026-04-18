'use client';

import { useState, useTransition } from 'react';
import { executeGraph } from '@/actions/projects';

interface Props {
  projectId: string;
}

export function ExecuteGraphButton({ projectId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleExecute() {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await executeGraph(projectId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setErrorMsg(msg);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
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
      {errorMsg && (
        <p className="text-[11px] text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
