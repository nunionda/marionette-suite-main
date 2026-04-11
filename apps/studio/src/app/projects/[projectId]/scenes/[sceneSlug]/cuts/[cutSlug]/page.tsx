import { fetchSceneDetail } from '@/lib/studio/api';
import { CutNodeEditor } from '@/components/studio/CutNodeEditor';

interface Props {
  params: Promise<{ projectId: string; sceneSlug: string; cutSlug: string }>;
}

export default async function CutPage({ params }: Props) {
  const { projectId, sceneSlug, cutSlug } = await params;

  const scene = await fetchSceneDetail(projectId, sceneSlug);

  if (!scene) {
    return (
      <div className="px-8 py-8 text-[var(--studio-text-muted)] text-[13px]">
        Scene not found.
      </div>
    );
  }

  const cuts = scene.cuts;
  const cutIndex = cuts.findIndex((c) => c.slug === cutSlug);

  if (cutIndex === -1) {
    return (
      <div className="px-8 py-8 text-[var(--studio-text-muted)] text-[13px]">
        Cut not found.
      </div>
    );
  }

  const cut = cuts[cutIndex];
  const prevCut = cutIndex > 0 ? cuts[cutIndex - 1] : null;
  const nextCut = cutIndex < cuts.length - 1 ? cuts[cutIndex + 1] : null;

  const script =
    cut.description ??
    `Scene ${scene.number}, Cut ${cut.number}.\n\n${scene.summary}`;

  return (
    <CutNodeEditor
      projectId={projectId}
      sceneSlug={sceneSlug}
      cutSlug={cutSlug}
      script={script}
      displayId={cut.displayId}
      prevCut={prevCut ? { slug: prevCut.slug, displayId: prevCut.displayId } : null}
      nextCut={nextCut ? { slug: nextCut.slug, displayId: nextCut.displayId } : null}
      cutIndex={cutIndex + 1}
      cutTotal={cuts.length}
    />
  );
}
