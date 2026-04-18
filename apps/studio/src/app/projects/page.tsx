import { fetchProjects } from '@/lib/studio/api';
import { ProjectCard } from '@/components/studio/ProjectCard';
import { Film } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await fetchProjects();

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Film size={20} className="text-[var(--studio-accent)]" />
          <h1 className="text-[28px] font-bold text-[var(--studio-text)]">Projects</h1>
        </div>
        <p className="text-[var(--studio-text-dim)] text-[14px]">
          {projects.length} active project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-24 text-[var(--studio-text-dim)]">
          <Film size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-[16px]">No projects yet</p>
        </div>
      )}
    </div>
  );
}
