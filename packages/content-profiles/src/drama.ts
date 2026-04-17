import type { ContentProfile } from "@marionette/pipeline-core";

/** Drama: 에피소드 반복 구조. 시즌 단위로 루프. */
export const dramaProfile: ContentProfile = {
  category: "drama",
  label: "드라마",
  ui: { emphasize: "MAIN" },
  metrics: ["rating", "ott_rank", "episode_completion_rate", "international_license"],
  stakeholders: ["producer", "showrunner", "network_exec", "platform_partner"],
  stages: [
    {
      phase: "PRE",
      stageId: "pre.series_bible",
      label: "시리즈 바이블",
      weight: 80,
      artifacts: [
        { id: "logline", kind: "logline", required: true },
        { id: "treatment", kind: "treatment", required: true },
      ],
      gates: [
        { id: "pilot_green", description: "파일럿 그린라이트", validator: "human_review" },
      ],
    },
    {
      phase: "PRE",
      stageId: "pre.episode_scripts",
      label: "에피소드 스크립트",
      weight: 80,
      artifacts: [
        { id: "script", kind: "script", required: true },
      ],
      gates: [],
    },
    {
      phase: "MAIN",
      stageId: "main.parallel_shoot",
      label: "병렬 촬영",
      weight: 100,
      artifacts: [
        { id: "call_sheet", kind: "call_sheet", required: true },
        { id: "footage", kind: "footage", required: true },
      ],
      gates: [],
    },
    {
      phase: "POST",
      stageId: "post.episode_delivery",
      label: "에피소드 편집/납품",
      weight: 100,
      artifacts: [
        { id: "edit_cut", kind: "edit_cut", required: true },
        { id: "master", kind: "delivery_master", required: true },
      ],
      gates: [],
    },
    {
      phase: "LIBRARY",
      stageId: "library.season_analytics",
      label: "시즌 성과",
      weight: 60,
      artifacts: [
        { id: "analytics", kind: "analytics_report", required: false },
      ],
      gates: [],
    },
  ],
  generationTarget: {
    platform: "higgsfield",
    product: "cinema-studio-3.5",
    promptStyle: "episodic",
    shotStructure: "sequential",
  },
};
