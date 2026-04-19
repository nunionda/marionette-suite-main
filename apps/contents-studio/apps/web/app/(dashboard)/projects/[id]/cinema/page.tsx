import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge/registry";
import { getCinemaEngine } from "../../../../../lib/cinema/engine";
import { CinemaClient } from "./cinema-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Cinema Studio 3.5 route — server component that seeds the page with
 * the project's existing elements so the client form can reference them
 * without a round-trip on mount.
 */
export default async function CinemaPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const { store } = getCinemaEngine();
  const elements = await store.query({ projectId: id });

  return (
    <CinemaClient
      projectId={id}
      projectTitle={entry.title}
      initialElements={elements.map((el) => ({
        id: el.id,
        name: el.name,
        kind: el.kind,
        trained: el.identity?.trained === true,
      }))}
    />
  );
}
