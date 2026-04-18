import { StudioNav } from '@/components/studio/StudioNav';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
    >
      <StudioNav />
      <main style={{ paddingTop: 'var(--studio-nav-h)' }}>{children}</main>
    </div>
  );
}
