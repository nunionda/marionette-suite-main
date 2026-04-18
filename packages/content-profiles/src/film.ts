import type { ContentProfile } from "@marionette/pipeline-core";

export const filmProfile: ContentProfile = {
  category: "film",
  label: "영화",
  ui: { emphasize: "PRE" },
  metrics: ["box_office", "admissions", "festival_selections", "streaming_views"],
  stakeholders: ["producer", "director", "investor", "distributor"],
  stages: [
    {
      phase: "PRE",
      stageId: "pre.development",
      label: "기획/시나리오",
      weight: 100,
      artifacts: [
        { id: "logline", kind: "logline", required: true },
        { id: "treatment", kind: "treatment", required: true },
        { id: "script", kind: "script", required: true },
        { id: "budget", kind: "budget", required: true },
      ],
      gates: [
        { id: "investor_gate", description: "투자사 평가 리포트 승인", validator: "human_review" },
      ],
    },
    {
      phase: "PRE",
      stageId: "pre.pre_production",
      label: "프리프로덕션",
      weight: 80,
      artifacts: [
        { id: "storyboard", kind: "storyboard", required: true },
        { id: "call_sheet", kind: "call_sheet", required: true },
      ],
      gates: [
        { id: "greenlight", description: "제작 그린라이트", validator: "human_review" },
      ],
    },
    {
      phase: "MAIN",
      stageId: "main.production",
      label: "촬영",
      weight: 80,
      artifacts: [
        { id: "daily_log", kind: "daily_log", required: true },
        { id: "footage", kind: "footage", required: true },
      ],
      gates: [
        { id: "wrap", description: "촬영 종료", validator: "human_review" },
      ],
    },
    {
      phase: "POST",
      stageId: "post.editorial",
      label: "편집·VFX·사운드",
      weight: 100,
      artifacts: [
        { id: "edit_cut", kind: "edit_cut", required: true },
        { id: "vfx_shot", kind: "vfx_shot", required: false },
        { id: "sound_mix", kind: "sound_mix", required: true },
        { id: "color_master", kind: "color_master", required: true },
      ],
      gates: [
        { id: "locked_cut", description: "락 컷 승인", validator: "human_review" },
      ],
    },
    {
      phase: "POST",
      stageId: "post.delivery",
      label: "납품",
      weight: 60,
      artifacts: [
        { id: "dcp", kind: "delivery_master", required: true },
      ],
      gates: [],
    },
    {
      phase: "LIBRARY",
      stageId: "library.archive",
      label: "배포/성과",
      weight: 40,
      artifacts: [
        { id: "analytics", kind: "analytics_report", required: false },
      ],
      gates: [],
    },
  ],
  generationTarget: {
    platform: "higgsfield",
    product: "cinema-studio-3.5",
    promptStyle: "cinematic",
    shotStructure: "sequential",
  },
};
