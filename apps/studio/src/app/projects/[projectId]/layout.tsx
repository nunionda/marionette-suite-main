import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProject } from '@/lib/studio/api';
import { StudioNav } from '@/components/studio/StudioNav';
import { LayoutGrid, Layers, Bot, BookOpen, Package, KeyRound } from 'lucide-react';

const TABS = [
  { key: 'overview',  label: '개요',          icon: LayoutGrid, href: '' },
  { key: 'scenes',    label: '씬 목록',        icon: Layers,     href: '/scenes' },
  { key: 'agents',    label: '에이전트',       icon: Bot,        href: '/agents' },
  { key: 'bible',     label: '프로덕션 바이블', icon: BookOpen,  href: '/bible' },
  { key: 'delivery',  label: '딜리버리',       icon: Package,    href: '/delivery' },
  { key: 'vault',     label: 'API 키 보관소',  icon: KeyRound,   href: '/vault' },
] as const;

interface Props {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: Props) {
  const { projectId } = await params;
  const project = await fetchProject(projectId);
  if (!project) notFound();

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project.initials },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
    >
      <StudioNav breadcrumbs={breadcrumbs} />
      <div className="flex flex-1" style={{ paddingTop: 'var(--studio-nav-h)' }}>
        {/* Sidebar */}
        <aside
          className="shrink-0 border-r border-[var(--studio-border)] flex flex-col py-6 gap-1"
          style={{ width: 'var(--studio-sidebar-w)', background: 'var(--studio-bg-surface)' }}
        >
          <div className="px-4 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--studio-accent)] mb-1">
              {project.initials}
            </p>
            <p className="text-[14px] font-semibold text-[var(--studio-text)] leading-tight">
              {project.title}
            </p>
          </div>
          {TABS.map(tab => (
            <Link
              key={tab.key}
              href={`/projects/${projectId}${tab.href}`}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded text-[13px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] hover:bg-[var(--studio-bg-hover)] transition-colors"
            >
              <tab.icon size={15} />
              {tab.label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
