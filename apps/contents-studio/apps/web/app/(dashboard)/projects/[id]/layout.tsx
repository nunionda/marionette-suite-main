import Link from "next/link";
import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge/registry";

/**
 * Project-scoped sub-nav. Appears above every /projects/[id]/* page,
 * giving the operator one-click access to every engine + panel attached
 * to the project.
 *
 * Implemented as a Server Component layout — Next.js applies it to all
 * nested routes under /projects/[id]/ automatically. The active link is
 * computed on the client via a small nested client component that reads
 * the pathname.
 */
import { ProjectSubNavClient } from "./project-subnav-client";

interface LayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export default async function ProjectLayout({ params, children }: LayoutProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const links = [
    { href: `/projects/${id}`, label: "Overview" },
    { href: `/projects/${id}/screenplay`, label: "Screenplay" },
    { href: `/projects/${id}/cinema`, label: "Cinema Studio" },
    { href: `/projects/${id}/marketing`, label: "Marketing Studio" },
    { href: `/projects/${id}/elements`, label: "Elements" },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Project
          </div>
          <h1 className="text-xl font-semibold text-white">{entry.title}</h1>
        </div>
        <Link
          href="/ai-ops"
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          AI Ops ↗
        </Link>
      </header>
      <ProjectSubNavClient links={links} />
      <div>{children}</div>
    </div>
  );
}
