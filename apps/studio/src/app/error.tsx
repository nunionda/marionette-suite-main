'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Studio] Unhandled error:', error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-4"
      style={{ color: 'var(--studio-text)', background: 'var(--studio-bg-base)' }}
    >
      <p className="text-[13px] text-[var(--studio-text-muted)]">페이지를 불러오는 중 오류가 발생했습니다</p>
      <p className="text-[11px] font-mono text-red-400 max-w-[400px] text-center truncate">
        {error.message || '알 수 없는 오류'}
      </p>
      <button
        onClick={reset}
        className="mt-2 px-4 py-1.5 rounded text-[12px] font-semibold"
        style={{ background: 'var(--studio-accent, #6366f1)', color: '#fff' }}
      >
        다시 시도
      </button>
    </div>
  );
}
