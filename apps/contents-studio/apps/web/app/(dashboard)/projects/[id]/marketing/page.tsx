import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge/registry";
import { getCinemaEngine } from "../../../../../lib/cinema/engine";
import { MarketingClient } from "./marketing-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Marketing Studio route (project-scoped). Seeds the page with the project's
 * elements so an avatar can be selected without a round-trip.
 */
export default async function MarketingPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const { store } = getCinemaEngine();
  const elements = await store.query({ projectId: id });

  return (
    <MarketingClient
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
