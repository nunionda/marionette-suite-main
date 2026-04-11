'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveMastering } from '@/actions/delivery';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface PackageStatus {
  status: string;
  download_url?: string | null;
  filename?: string;
}

interface Props {
  projectId: string;
  packageStatus: PackageStatus | null;
}

export function DeliveryActions({ projectId, packageStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleApprove() {
    setMessage(null);
    startTransition(async () => {
      try {
        await approveMastering(projectId);
        setMessage('마스터링 작업이 시작되었습니다. 완료 후 패키지가 준비됩니다.');
        router.refresh();
      } catch {
        setMessage('마스터링 승인에 실패했습니다. 에셋이 생성되어 있는지 확인해주세요.');
      }
    });
  }

  const isReady = packageStatus?.status === 'ready';

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleApprove}
        disabled={isPending || isReady}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'var(--studio-bg-surface)',
          border: '1px solid var(--studio-border)',
          color: 'var(--studio-text)',
        }}
      >
        {isPending ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <CheckCircle size={14} />
        )}
        {isPending ? '처리 중...' : isReady ? '마스터링 완료' : '4K 마스터링 승인'}
      </button>
      {message && (
        <p className="text-[11px] text-[var(--studio-text-dim)] max-w-[280px] text-right">{message}</p>
      )}
    </div>
  );
}
