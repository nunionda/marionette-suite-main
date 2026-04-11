"use client";

import type { Project } from "@/lib/studio/types";

interface Scene {
  scene_number: number;
  setting: string;
  time_of_day?: string;
  characters?: string[];
  action_description?: string;
}

interface Props {
  project: Project;
}

export function ScriptViewer({ project }: Props) {
  const plan = project.direction_plan_json as { scenes?: Scene[] } | null;
  const scenes: Scene[] = plan?.scenes ?? [];

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <p className="text-lg">아직 시나리오가 생성되지 않았습니다.</p>
        <p className="text-sm mt-2">파이프라인에서 Script Writer 에이전트를 실행하면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {scenes.map((scene) => (
        <div key={scene.scene_number} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono text-zinc-500">SC{String(scene.scene_number).padStart(3, "0")}</span>
            <h3 className="font-semibold text-white">{scene.setting}</h3>
            {scene.time_of_day && (
              <span className="text-xs text-zinc-400 border border-zinc-700 rounded px-2 py-0.5">{scene.time_of_day}</span>
            )}
          </div>
          {scene.characters && scene.characters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {scene.characters.map((c) => (
                <span key={c} className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-3 py-1">{c}</span>
              ))}
            </div>
          )}
          {scene.action_description && (
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{scene.action_description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
