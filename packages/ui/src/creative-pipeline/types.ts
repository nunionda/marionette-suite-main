import type { ContentCategory } from "@marionette/pipeline-core";

export type StepKey =
  | "logline"
  | "synopsis"
  | "treatment"
  | "script"
  | "scene"
  | "cut"
  | "image-prompt"
  | "video-prompt";

export type StepStatus = "not_started" | "in_progress" | "review" | "locked";

export const STEPS: { key: StepKey; label: string; description: string; order: number }[] = [
  { key: "logline", label: "로그라인", description: "1줄 요약", order: 1 },
  { key: "synopsis", label: "시놉시스", description: "스토리 요약", order: 2 },
  { key: "treatment", label: "트리트먼트", description: "구조·캐릭터·테마", order: 3 },
  { key: "script", label: "스크립트", description: "씬별 대사·액션", order: 4 },
  { key: "scene", label: "씬 분해", description: "씬 리스트", order: 5 },
  { key: "cut", label: "컷 분해", description: "샷별 분해", order: 6 },
  { key: "image-prompt", label: "이미지 프롬프트", description: "컷별 비주얼", order: 7 },
  { key: "video-prompt", label: "비디오 프롬프트", description: "모션·카메라 무브", order: 8 },
];

export interface StepProgress {
  key: StepKey;
  status: StepStatus;
  lastUpdated?: string;
  previewText?: string;
  count?: number;
}

export interface ProjectMeta {
  id: string;
  title: string;
  category: ContentCategory;
  ownerStudio: "STE" | "IMP" | "MAR";
  priority: "P0" | "P1" | "P2";
  budgetKRW?: number;
  genre?: string;
}

export interface DeepLink {
  url: string;
  label: string;
}
