import type { ContentCategory, Phase, StudioCode } from "@marionette/pipeline-core";

export type { ContentCategory, Phase, StudioCode };

export type ProjectStatus = "DRAFT" | "DEVELOPMENT" | "PRODUCTION" | "POST" | "DELIVERED" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  category: ContentCategory;
  studio: StudioCode;
  status: ProjectStatus;
  currentPhase: Phase;
  progress: number; // 0-100
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  projectId: string;
  number: number;
  heading: string;
  location?: string;
  timeOfDay?: "D" | "N" | "DN" | "ND";
  intExt?: "INT" | "EXT" | "INT_EXT";
  pageCount?: number;
  characters: string[];
}

export interface Cut {
  id: string;
  sceneId: string;
  number: number;
  description?: string;
  shotType?: string;
  duration?: number; // seconds
  assetIds: string[];
}

export type AssetKind = "image" | "video" | "audio" | "document" | "3d_model";

export interface Asset {
  id: string;
  projectId: string;
  kind: AssetKind;
  uri: string;
  label?: string;
  createdAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: "LEAD" | "SUPPORT" | "EXTRA";
  actor?: string;
}

/** Polymorphic metrics: keyed by content category. Only relevant ones populate. */
export interface ContentMetrics {
  // Film
  box_office?: number;
  admissions?: number;
  festival_selections?: string[];
  // Drama
  rating?: number;
  ott_rank?: number;
  episode_completion_rate?: number;
  // Commercial
  cpm?: number;
  ctr?: number;
  conversion_rate?: number;
  brand_lift?: number;
  // YouTube
  views?: number;
  watch_time_hours?: number;
  subscribers_gained?: number;
  rpm?: number;
  thumbnail_ctr?: number;
}

export interface LibraryEntry {
  id: string;
  projectId: string;
  category: ContentCategory;
  title: string;
  runtime?: number;
  releaseDate?: string;
  channels: string[];
  deliverables: string[];
  metrics: ContentMetrics;
  studio: StudioCode;
}
