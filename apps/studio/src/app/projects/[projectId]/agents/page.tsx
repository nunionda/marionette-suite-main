import { Bot } from 'lucide-react';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function AgentsPage({ params }: Props) {
  const { projectId } = await params;

  return (
    <div className="px-8 py-8">
      <h1 className="text-[22px] font-bold text-[var(--studio-text)] mb-2">에이전트</h1>
      <p className="text-[13px] text-[var(--studio-text-dim)] mb-10">
        AI 생성 에이전트 관리 및 모니터링
      </p>

      <div
        className="rounded-lg border border-[var(--studio-border)] p-12 flex flex-col items-center justify-center text-center"
        style={{ background: 'var(--studio-bg-surface)', minHeight: 360 }}
      >
        <Bot size={40} className="mb-4" style={{ color: 'var(--studio-text-muted)' }} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--studio-accent)] mb-3">
          Phase 2
        </p>
        <h2 className="text-[18px] font-bold text-[var(--studio-text)] mb-2">에이전트 대시보드</h2>
        <p className="text-[13px] text-[var(--studio-text-dim)] max-w-md">
          이미지·영상 생성 에이전트 모니터링, 큐 관리, 오류 재시도 기능은 Phase 2에서 구현됩니다.
        </p>
        <p className="font-mono text-[11px] text-[var(--studio-text-muted)] mt-6">{projectId}</p>
      </div>
    </div>
  );
}
