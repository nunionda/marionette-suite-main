import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  params: Promise<{ projectId: string; sceneSlug: string; cutSlug: string }>;
}

export default async function CutPage({ params }: Props) {
  const { projectId, sceneSlug, cutSlug } = await params;

  return (
    <div className="px-8 py-8">
      <Link
        href={`/projects/${projectId}/scenes/${sceneSlug}`}
        className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] transition-colors mb-8"
      >
        <ChevronLeft size={14} />
        씬으로 돌아가기
      </Link>

      <div
        className="rounded-lg border border-[var(--studio-border)] p-12 flex flex-col items-center justify-center text-center"
        style={{ background: 'var(--studio-bg-surface)', minHeight: 360 }}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--studio-accent)] mb-3">
          Phase 3
        </p>
        <h1 className="text-[22px] font-bold text-[var(--studio-text)] mb-2">컷 에디터</h1>
        <p className="text-[13px] text-[var(--studio-text-dim)] mb-6 max-w-md">
          컷 단위 AI 생성 및 편집 인터페이스는 Phase 3에서 구현됩니다.
        </p>
        <p className="font-mono text-[11px] text-[var(--studio-text-muted)]">
          {projectId} / {sceneSlug} / {cutSlug}
        </p>
      </div>
    </div>
  );
}
