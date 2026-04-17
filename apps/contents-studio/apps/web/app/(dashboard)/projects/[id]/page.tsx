import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge/registry";
import { PipelineClient } from "./pipeline-client";
import type { ProjectMeta } from "@marionette/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPipelinePage({ params }: PageProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const meta: ProjectMeta = {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    ownerStudio: entry.ownerStudio,
    priority: entry.priority,
    budgetKRW: entry.budgetKRW,
    genre: entry.genre,
  };

  return <PipelineClient meta={meta} />;
}
