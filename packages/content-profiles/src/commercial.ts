import type { ContentProfile } from "@marionette/pipeline-core";

/** Commercial: 클라이언트 브리핑 중심. PRE 비중 60%. */
export const commercialProfile: ContentProfile = {
  category: "commercial",
  label: "광고",
  ui: { emphasize: "PRE", collapse: ["LIBRARY"] },
  metrics: ["cpm", "ctr", "conversion_rate", "brand_lift"],
  stakeholders: ["client", "agency_producer", "creative_director", "account_manager"],
  stages: [
    {
      phase: "PRE",
      stageId: "pre.client_brief",
      label: "클라이언트 브리프",
      weight: 100,
      artifacts: [
        { id: "brief", kind: "client_brief", required: true },
        { id: "treatment", kind: "treatment", required: true },
        { id: "storyboard", kind: "storyboard", required: true },
        { id: "budget", kind: "budget", required: true },
      ],
      gates: [
        { id: "client_approval", description: "클라이언트 승인", validator: "human_review" },
      ],
    },
    {
      phase: "MAIN",
      stageId: "main.shoot",
      label: "촬영",
      weight: 60,
      artifacts: [
        { id: "footage", kind: "footage", required: true },
      ],
      gates: [],
    },
    {
      phase: "POST",
      stageId: "post.master",
      label: "마스터 편집",
      weight: 40,
      artifacts: [
        { id: "master_15s", kind: "delivery_master", required: true },
        { id: "master_30s", kind: "delivery_master", required: false },
      ],
      gates: [
        { id: "final_approval", description: "클라이언트 최종 승인", validator: "human_review" },
      ],
    },
  ],
  generationTarget: {
    platform: "higgsfield",
    product: "marketing-studio",
    promptStyle: "ad-cgi",
    shotStructure: "parallel",
  },
};
