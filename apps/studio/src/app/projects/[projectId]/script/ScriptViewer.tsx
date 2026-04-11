"use client";

import type { Project } from "@/lib/studio/types";

// ScriptWriterAgent (FastAPI 파이프라인) 출력 포맷
interface AgentScene {
  scene_number: number;
  setting: string;
  time_of_day?: string;
  characters?: string[];
  action_description?: string;
}

// script-writer 앱(Elysia :3006)에서 내보낸 pipelineData 포맷
interface ScriptWriterData {
  scenario?: string;   // 영화 시나리오 원문 텍스트
  script?: string;     // 드라마 에피소드 스크립트
  logline?: string;
  treatment?: string;
  bible?: string;
}

interface Props {
  project: Project;
}

export function ScriptViewer({ project }: Props) {
  const plan = project.direction_plan_json as (
    | { scenes?: AgentScene[] }
    | ScriptWriterData
    | null
  );

  // --- 포맷 1: ScriptWriterAgent 씬 배열 ---
  const agentScenes: AgentScene[] = (plan as { scenes?: AgentScene[] })?.scenes ?? [];
  if (agentScenes.length > 0 && typeof agentScenes[0].scene_number === "number") {
    return (
      <div className="space-y-6">
        {agentScenes.map((scene) => (
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

  // --- 포맷 2: script-writer 앱에서 내보낸 원문 텍스트 ---
  const sw = plan as ScriptWriterData | null;
  const rawScript = sw?.scenario || sw?.script;
  if (rawScript) {
    const label = sw?.bible ? "드라마 시리즈" : "시나리오";
    return (
      <div className="space-y-4">
        {sw?.logline && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4">
            <p className="text-xs text-zinc-500 mb-1 font-mono">LOGLINE</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{sw.logline}</p>
          </div>
        )}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-xs text-zinc-500 mb-4 font-mono uppercase tracking-widest">{label} 원문</p>
          <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">{rawScript}</pre>
        </div>
      </div>
    );
  }

  // --- 빈 상태 ---
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
      <p className="text-lg">아직 시나리오가 생성되지 않았습니다.</p>
      <p className="text-sm mt-2">
        파이프라인에서 Script Writer를 실행하거나, script-writer 앱에서 &apos;Studio로 내보내기&apos;를 누르세요.
      </p>
    </div>
  );
}
