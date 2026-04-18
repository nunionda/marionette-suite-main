import type { LibraryEntry } from "@marionette/types-content";

/**
 * Content Library mock entries. Each entry's `metrics` field only populates
 * the fields relevant to its category — polymorphic by design.
 *
 * Film: box_office / admissions / festival
 * Drama: rating / ott_rank / completion rate
 * Commercial: CPM / CTR / conversion / brand lift
 * YouTube: views / watch time / subs / RPM / thumbnail CTR
 */
export const mockEntries: LibraryEntry[] = [
  {
    id: "L-001",
    projectId: "ID-001",
    category: "film",
    title: "DECODE",
    runtime: 142,
    releaseDate: "2026-05-20",
    channels: ["CJ CGV", "Lotte Cinema", "Netflix Korea"],
    deliverables: ["DCP-2K", "DCP-4K", "Netflix-IMF"],
    studio: "IMP",
    metrics: {
      box_office: 8_420_000_000,
      admissions: 1_052_400,
      festival_selections: ["BIFF 2026 · Opening", "Sitges 2026"],
    },
  },
  {
    id: "L-002",
    projectId: "ID-002",
    category: "film",
    title: "어머니의 이력서",
    runtime: 108,
    releaseDate: "2026-06-05",
    channels: ["CGV Arthouse", "KBS Independent"],
    deliverables: ["DCP-2K", "KOBIS-Master"],
    studio: "STE",
    metrics: {
      box_office: 640_000_000,
      admissions: 82_000,
      festival_selections: ["Jeonju IFF 2026"],
    },
  },
  {
    id: "L-003",
    projectId: "DR-NETFLIX-01",
    category: "drama",
    title: "Nano Community — Season 1",
    runtime: 50 * 10,
    releaseDate: "2026-03-01",
    channels: ["Netflix Global"],
    deliverables: ["Netflix-IMF × 10"],
    studio: "STE",
    metrics: {
      rating: 8.4,
      ott_rank: 3,
      episode_completion_rate: 0.81,
    },
  },
  {
    id: "L-004",
    projectId: "NL-CM",
    category: "commercial",
    title: "Nike LIMITLESS — 30s",
    runtime: 30,
    releaseDate: "2026-04-15",
    channels: ["KBS", "MBC", "YouTube Pre-roll", "Instagram", "TikTok"],
    deliverables: ["Broadcast-ProRes", "Social-1x1", "Social-9x16", "YT-16x9"],
    studio: "STE",
    metrics: {
      cpm: 4200,
      ctr: 0.061,
      conversion_rate: 0.018,
      brand_lift: 0.23,
    },
  },
  {
    id: "L-005",
    projectId: "YT-BEAT-SAVIOR",
    category: "youtube",
    title: "Beat Savior — Ep. 1",
    runtime: 12 * 60,
    releaseDate: "2026-02-10",
    channels: ["YouTube"],
    deliverables: ["YT-16x9", "Shorts-9x16"],
    studio: "MAR",
    metrics: {
      views: 842_000,
      watch_time_hours: 54_200,
      subscribers_gained: 3_100,
      rpm: 3.8,
      thumbnail_ctr: 0.084,
    },
  },
];
