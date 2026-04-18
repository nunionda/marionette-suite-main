import { notFound } from 'next/navigation';
import { fetchProject } from '@/lib/studio/api';
import { getProjectManifest, getPackageStatus } from '@/actions/delivery';
import { DeliveryActions } from './DeliveryActions';
import { Package, Film, ImageIcon } from 'lucide-react';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function DeliveryPage({ params }: Props) {
  const { projectId } = await params;
  const [project, manifest, packageStatus] = await Promise.all([
    fetchProject(projectId),
    getProjectManifest(projectId),
    getPackageStatus(projectId),
  ]);
  if (!project) notFound();

  const assets: string[] = manifest?.assets ?? [];
  const imageAssets = assets.filter((p: string) => p.endsWith('.png'));

  return (
    <div className="px-8 py-10 max-w-[1000px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--studio-text)]">딜리버리</h1>
          <p className="text-[13px] text-[var(--studio-text-dim)] mt-1">
            생성된 에셋 매니페스트 확인 및 최종 패키지 다운로드
          </p>
        </div>
        <DeliveryActions projectId={projectId} packageStatus={packageStatus} />
      </div>

      {/* Package download card */}
      {packageStatus?.status === 'ready' && packageStatus.download_url && (
        <div
          className="mb-6 rounded-lg border border-[var(--studio-border)] p-6 flex items-center justify-between"
          style={{ background: 'var(--studio-bg-surface)' }}
        >
          <div className="flex items-center gap-3">
            <Film size={20} className="text-[var(--studio-accent)]" />
            <div>
              <p className="text-[14px] font-semibold text-[var(--studio-text)]">최종 마스터 패키지</p>
              <p className="text-[12px] text-[var(--studio-text-dim)]">{packageStatus.filename}</p>
            </div>
          </div>
          <a
            href={packageStatus.download_url}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold"
            style={{ background: 'var(--studio-accent)', color: '#000' }}
          >
            <Package size={14} />
            다운로드
          </a>
        </div>
      )}

      {/* Manifest summary */}
      <div
        className="mb-6 rounded-lg border border-[var(--studio-border)] p-6"
        style={{ background: 'var(--studio-bg-surface)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon size={16} className="text-[var(--studio-text-dim)]" />
          <h2 className="text-[14px] font-semibold text-[var(--studio-text)]">에셋 매니페스트</h2>
          <span
            className="ml-auto text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: manifest?.status === 'ready' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
              color: manifest?.status === 'ready' ? 'rgb(74,222,128)' : 'var(--studio-text-dim)',
            }}
          >
            {manifest?.status === 'ready' ? '준비됨' : '미생성'}
          </span>
        </div>

        {imageAssets.length > 0 ? (
          <>
            <p className="text-[12px] text-[var(--studio-text-dim)] mb-4">
              총 {imageAssets.length}개 에셋
              {manifest?.generated_at && (
                <span> · 생성: {new Date(manifest.generated_at).toLocaleString('ko-KR')}</span>
              )}
            </p>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
              {imageAssets.map((path: string, i: number) => {
                const filename = path.split('/').pop() ?? path;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded text-[12px]"
                    style={{ background: 'var(--studio-bg-hover)' }}
                  >
                    <span className="text-[var(--studio-text-dim)] w-6 text-right shrink-0">{i + 1}</span>
                    <span className="text-[var(--studio-text)] truncate">{filename}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-[var(--studio-text-dim)]">
            파이프라인을 완료하면 에셋 목록이 여기에 표시됩니다
          </p>
        )}
      </div>
    </div>
  );
}
