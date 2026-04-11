import { notFound } from 'next/navigation';
import { fetchProject, fetchAgents } from '@/lib/studio/api';
import { getPresets } from '@/actions/projects';
import { AgentDashboard } from '@/components/studio/AgentDashboard';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function AgentsPage({ params }: Props) {
  const { projectId } = await params;
  const [project, agents, presets] = await Promise.all([
    fetchProject(projectId),
    fetchAgents(projectId),
    getPresets(),
  ]);
  if (!project) notFound();

  return (
    <div style={{ height: 'calc(100vh - var(--studio-nav-h))' }}>
      <AgentDashboard initialAgents={agents} projectId={projectId} presets={presets} />
    </div>
  );
}
