import { notFound } from 'next/navigation';
import { fetchProject } from '@/lib/studio/api';
import { getBibleContent } from '@/actions/bible';
import { BibleActions } from './BibleActions';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function BiblePage({ params }: Props) {
  const { projectId } = await params;
  const [project, content] = await Promise.all([
    fetchProject(projectId),
    getBibleContent(projectId),
  ]);
  if (!project) notFound();

  return (
    <div className="px-8 py-10 max-w-[900px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--studio-text)]">프로덕션 바이블</h1>
          <p className="text-[13px] text-[var(--studio-text-dim)] mt-1">
            AI가 생성한 제작 기준서 — 씬 목록, 세계관, 캐릭터, 시각 언어를 포함합니다
          </p>
        </div>
        <BibleActions projectId={projectId} hasContent={!!content} />
      </div>

      {content ? (
        <div
          className="rounded-lg border border-[var(--studio-border)] p-8"
          style={{ background: 'var(--studio-bg-surface)' }}
        >
          <pre
            className="text-[13px] text-[var(--studio-text)] leading-relaxed whitespace-pre-wrap font-mono"
            style={{ fontFamily: 'var(--font-mono, monospace)' }}
          >
            {content}
          </pre>
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed border-[var(--studio-border)] p-16 text-center"
          style={{ background: 'var(--studio-bg-surface)' }}
        >
          <p className="text-[14px] text-[var(--studio-text-dim)] mb-2">
            아직 생성된 바이블이 없습니다
          </p>
          <p className="text-[12px] text-[var(--studio-text-dim)]">
            파이프라인을 실행하거나 위의 버튼으로 직접 생성하세요
          </p>
        </div>
      )}
    </div>
  );
}
