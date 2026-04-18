import { notFound } from 'next/navigation';
import { fetchProject } from '@/lib/studio/api';
import { listCredentials } from '@/actions/vault';
import { VaultManager } from './VaultManager';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function VaultPage({ params }: Props) {
  const { projectId } = await params;
  const [project, credentials] = await Promise.all([
    fetchProject(projectId),
    listCredentials(),
  ]);
  if (!project) notFound();

  return (
    <div className="px-8 py-10 max-w-[700px]">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold text-[var(--studio-text)]">API 키 보관소</h1>
        <p className="text-[13px] text-[var(--studio-text-dim)] mt-1">
          파이프라인 에이전트가 사용할 외부 서비스 API 키를 안전하게 보관합니다
        </p>
      </div>
      <VaultManager initialCredentials={credentials} />
    </div>
  );
}
