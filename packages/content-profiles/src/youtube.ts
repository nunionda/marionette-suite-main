import type { ContentProfile } from "@marionette/pipeline-core";

/** YouTube: PRE 최소, MAIN+POST 중심, LIBRARY 애널리틱스 루프 강화. */
export const youtubeProfile: ContentProfile = {
  category: "youtube",
  label: "유튜브",
  ui: { emphasize: "POST", collapse: ["PRE"] },
  metrics: ["views", "watch_time", "subscribers_gained", "rpm", "ctr_thumbnail"],
  stakeholders: ["creator", "editor", "thumbnail_designer"],
  stages: [
    {
      phase: "PRE",
      stageId: "pre.concept",
      label: "컨셉",
      weight: 20,
      artifacts: [
        { id: "logline", kind: "logline", required: true },
      ],
      gates: [],
    },
    {
      phase: "MAIN",
      stageId: "main.shoot",
      label: "촬영/녹화",
      weight: 60,
      artifacts: [
        { id: "footage", kind: "footage", required: true },
      ],
      gates: [],
    },
    {
      phase: "POST",
      stageId: "post.edit",
      label: "편집·썸네일",
      weight: 100,
      artifacts: [
        { id: "edit_cut", kind: "edit_cut", required: true },
        { id: "thumbnail", kind: "delivery_master", required: true },
      ],
      gates: [],
    },
    {
      phase: "LIBRARY",
      stageId: "library.analytics_loop",
      label: "성과 분석",
      weight: 100,
      artifacts: [
        { id: "analytics", kind: "analytics_report", required: true },
      ],
      gates: [
        { id: "retention_review", description: "리텐션 곡선 리뷰", validator: "automated_check" },
      ],
    },
  ],
  generationTarget: {
    platform: "higgsfield",
    product: "marketing-studio",
    promptStyle: "ad-ugc",
    shotStructure: "montage",
  },
};
