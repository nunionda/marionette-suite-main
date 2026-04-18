import { notFound } from "next/navigation";
import { fetchProject } from "@/lib/studio/api";
import { ScriptViewer } from "./ScriptViewer";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ScriptPage({ params }: Props) {
  const { projectId } = await params;
  const project = await fetchProject(projectId);
  if (!project) notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{project.title}</h1>
        <p className="text-zinc-400 text-sm mt-1">시나리오 / Direction Plan</p>
      </div>
      <ScriptViewer project={project} />
    </div>
  );
}
