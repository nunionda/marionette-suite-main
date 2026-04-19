import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge/registry";
import { getCinemaEngine } from "../../../../../lib/cinema/engine";
import { ElementsClient } from "./elements-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Elements Library — grid of every Element in the project, with inline
 * detail panel, reference list, train-Soul-ID button, and remove.
 *
 * Server Component seeds the initial list; the client reloads when an
 * Element is created, trained, or removed.
 */
export default async function ElementsPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const { store } = getCinemaEngine();
  const elements = await store.query({ projectId: id });

  return (
    <ElementsClient
      projectId={id}
      projectTitle={entry.title}
      initialElements={elements}
    />
  );
}
