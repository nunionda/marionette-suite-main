/**
 * Post-production mock data. Replace with API calls in Sprint 9+.
 *
 * Data model mirrors what the Content Library / Production Pipeline
 * will hand off when a project hits POST phase.
 */

import type { ContentCategory } from "@marionette/pipeline-core";

export interface PostProject {
  id: string;
  title: string;
  category: ContentCategory;
  studio: "STE" | "IMP" | "MAR";
  phase: "POST";
  editProgress: number;
  vfxShots: { total: number; done: number };
  soundReels: { total: number; done: number };
  colorReels: { total: number; done: number };
  deliveryFormats: string[];
}

export const mockProjects: PostProject[] = [
  {
    id: "ID-001",
    title: "DECODE",
    category: "film",
    studio: "IMP",
    phase: "POST",
    editProgress: 72,
    vfxShots: { total: 247, done: 168 },
    soundReels: { total: 6, done: 4 },
    colorReels: { total: 6, done: 2 },
    deliveryFormats: ["DCP-2K", "DCP-4K", "Netflix-IMF", "Trailer-HLS"],
  },
  {
    id: "ID-002",
    title: "어머니의 이력서",
    category: "film",
    studio: "STE",
    phase: "POST",
    editProgress: 45,
    vfxShots: { total: 32, done: 8 },
    soundReels: { total: 4, done: 1 },
    colorReels: { total: 4, done: 0 },
    deliveryFormats: ["DCP-2K", "KOBIS-Master"],
  },
  {
    id: "NL-CM",
    title: "Nike LIMITLESS — 30s Commercial",
    category: "commercial",
    studio: "STE",
    phase: "POST",
    editProgress: 95,
    vfxShots: { total: 18, done: 18 },
    soundReels: { total: 1, done: 1 },
    colorReels: { total: 1, done: 1 },
    deliveryFormats: ["Broadcast-ProRes", "Social-1x1", "Social-9x16", "YT-16x9"],
  },
];

export interface EditCut {
  id: string;
  projectId: string;
  sceneNumber: number;
  duration: number;
  status: "offline" | "online" | "locked";
  editor: string;
  note?: string;
}

export const mockEditCuts: EditCut[] = [
  { id: "C1", projectId: "ID-001", sceneNumber: 1, duration: 142, status: "locked", editor: "J. Park" },
  { id: "C2", projectId: "ID-001", sceneNumber: 2, duration: 88, status: "online", editor: "J. Park" },
  { id: "C3", projectId: "ID-001", sceneNumber: 3, duration: 210, status: "offline", editor: "S. Kim", note: "pending VFX plate" },
  { id: "C4", projectId: "NL-CM", sceneNumber: 1, duration: 15, status: "locked", editor: "M. Lee" },
  { id: "C5", projectId: "NL-CM", sceneNumber: 2, duration: 15, status: "locked", editor: "M. Lee" },
];

export interface VFXShot {
  id: string;
  projectId: string;
  shotCode: string;
  complexity: "low" | "med" | "high";
  status: "brief" | "wip" | "review" | "approved";
  vendor: string;
}

export const mockVFXShots: VFXShot[] = [
  { id: "V1", projectId: "ID-001", shotCode: "S01_010", complexity: "high", status: "approved", vendor: "Dexter Studios" },
  { id: "V2", projectId: "ID-001", shotCode: "S01_020", complexity: "high", status: "review", vendor: "Dexter Studios" },
  { id: "V3", projectId: "ID-001", shotCode: "S02_040", complexity: "med", status: "wip", vendor: "Macrograph" },
  { id: "V4", projectId: "ID-001", shotCode: "S03_110", complexity: "low", status: "brief", vendor: "Macrograph" },
  { id: "V5", projectId: "NL-CM", shotCode: "CM_003", complexity: "med", status: "approved", vendor: "In-house" },
];

export interface SoundReel {
  id: string;
  projectId: string;
  reelNumber: number;
  adr: { total: number; recorded: number };
  foley: "pending" | "in-progress" | "done";
  mix: "M&E" | "stereo" | "5.1" | "Atmos";
  status: "wip" | "approved";
}

export const mockSoundReels: SoundReel[] = [
  { id: "SR1", projectId: "ID-001", reelNumber: 1, adr: { total: 12, recorded: 12 }, foley: "done", mix: "Atmos", status: "approved" },
  { id: "SR2", projectId: "ID-001", reelNumber: 2, adr: { total: 8, recorded: 6 }, foley: "in-progress", mix: "Atmos", status: "wip" },
  { id: "SR3", projectId: "NL-CM", reelNumber: 1, adr: { total: 0, recorded: 0 }, foley: "done", mix: "stereo", status: "approved" },
];

export interface ColorReel {
  id: string;
  projectId: string;
  reelNumber: number;
  pass: "primary" | "secondary" | "finish";
  colorist: string;
  lut: string;
  status: "wip" | "review" | "approved";
}

export const mockColorReels: ColorReel[] = [
  { id: "CR1", projectId: "ID-001", reelNumber: 1, pass: "finish", colorist: "H. Choi", lut: "ACES-709", status: "approved" },
  { id: "CR2", projectId: "ID-001", reelNumber: 2, pass: "secondary", colorist: "H. Choi", lut: "ACES-709", status: "wip" },
  { id: "CR3", projectId: "NL-CM", reelNumber: 1, pass: "finish", colorist: "R. Jung", lut: "Rec709-Commercial", status: "approved" },
];

export interface DeliveryItem {
  id: string;
  projectId: string;
  format: string;
  resolution: string;
  codec: string;
  deliveredTo?: string;
  deliveryDate?: string;
  status: "queued" | "encoding" | "delivered" | "rejected";
}

export const mockDeliveries: DeliveryItem[] = [
  { id: "D1", projectId: "ID-001", format: "DCP-2K", resolution: "2048x858", codec: "JPEG2000", deliveredTo: "CJ CGV", deliveryDate: "2026-05-20", status: "delivered" },
  { id: "D2", projectId: "ID-001", format: "Netflix-IMF", resolution: "3840x1608", codec: "JPEG2000", status: "encoding" },
  { id: "D3", projectId: "NL-CM", format: "Broadcast-ProRes", resolution: "1920x1080", codec: "ProRes 422 HQ", deliveredTo: "Nike Global", deliveryDate: "2026-04-15", status: "delivered" },
  { id: "D4", projectId: "NL-CM", format: "YT-16x9", resolution: "3840x2160", codec: "H.265", deliveredTo: "Nike YouTube", deliveryDate: "2026-04-16", status: "delivered" },
  { id: "D5", projectId: "NL-CM", format: "Social-9x16", resolution: "1080x1920", codec: "H.264", status: "queued" },
];
