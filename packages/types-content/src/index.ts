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

// ─── Streaming / VOD Release (Phase 5 Distribution, Charter #69) ───

export type StreamingReleaseStatus =
  | "scheduled" // announced, not yet available
  | "live" // currently streamable
  | "ended" // release window closed
  | "withdrawn"; // taken down early

export type DRMScheme = "widevine" | "fairplay" | "playready" | "none";

export type HDRFormat = "sdr" | "hdr10" | "hdr10_plus" | "dolby_vision";

export type AudioFormat = "stereo" | "5_1" | "7_1" | "atmos";

export type Codec = "h264" | "h265" | "av1" | "vp9";

export type Resolution = "480p" | "720p" | "1080p" | "4K";

export interface StreamingBitrate {
  resolution: Resolution;
  codec: Codec;
  hdr?: HDRFormat;
  audio: AudioFormat;
  bitrateMbps?: number;
  cdnUrl?: string; // master manifest URL (HLS/DASH), optional
}

export interface StreamingPlatform {
  platform: string; // "Netflix Global", "Disney+ Korea", "Wavve", "Tving", etc.
  status: StreamingReleaseStatus;
  liveDate?: string; // ISO — when the release went/goes live
  endDate?: string; // ISO — windowing end, if any
  regions: string[]; // ISO country codes or ["global"]
  drm: DRMScheme[];
  bitrates: StreamingBitrate[];
}

export interface StreamingRelease {
  platforms: StreamingPlatform[];
  exclusivity?: "exclusive" | "non-exclusive" | "day-and-date";
  windowEnd?: string; // ISO — overall release window close
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
  /** Streaming/VOD release spec — Charter #69. Optional; absent for theatrical-only or unreleased. */
  streaming?: StreamingRelease;
}
