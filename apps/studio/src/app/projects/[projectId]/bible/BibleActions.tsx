'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateBible } from '@/actions/bible';
import { BookOpen, RefreshCw } from 'lucide-react';

interface Props {
  projectId: string;
  hasContent: boolean;
}

export function BibleActions({ projectId, hasContent }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        await generateBible(projectId);
        router.refresh();
      } catch (err) {
        setError('바이블 생성에 실패했습니다. 파이프라인을 먼저 실행해주세요.');
        console.error(err);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'var(--studio-accent)',
          color: '#000',
        }}
      >
        {isPending ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <BookOpen size={14} />
        )}
        {isPending ? '생성 중...' : hasContent ? '다시 생성' : '바이블 생성'}
      </button>
      {error && (
        <p className="text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );
}
