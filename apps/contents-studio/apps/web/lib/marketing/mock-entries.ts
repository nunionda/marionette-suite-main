// Marketing module — Sprint 7 #65
// Mock data. Tracks trailer versions, poster/key art, marketing asset approval.
// [AI-VID][AI-IMG] insertion point per Charter v2.0 §4.

export type AssetKind =
  | "teaser_trailer" // 티저 트레일러 (30s-60s)
  | "main_trailer" // 메인 트레일러 (2-3min)
  | "tv_spot" // TV 광고 (15s-30s)
  | "international_trailer"
  | "teaser_poster" // 티저 포스터
  | "main_poster" // 메인 포스터
  | "character_poster" // 캐릭터 포스터
  | "international_poster"
  | "key_art" // 키 아트
  | "social_asset"; // 소셜 미디어 자산

export type AssetStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "delivered"
  | "live";

export interface MarketingAsset {
  id: string;
  projectId: string;
  kind: AssetKind;
  label: string;
  durationSec?: number; // for video assets
  format?: string; // "1080p", "4K", "A1 Poster", "Instagram 1:1"
  languages?: string[]; // ["ko", "en"]
  aiGenerated?: boolean;
  vendor?: string;
  deliveryDate?: string; // ISO
  status: AssetStatus;
  note?: string;
}

export const mockMarketingAssets: MarketingAsset[] = [
  // ID-001 DECODE — ambitious marketing package
  {
    id: "MKT-001-01",
    projectId: "ID-001",
    kind: "teaser_trailer",
    label: "Teaser Trailer v2",
    durationSec: 60,
    format: "4K H.265",
    languages: ["ko", "en"],
    aiGenerated: false,
    vendor: "PRANK Studios",
    deliveryDate: "2026-07-15",
    status: "approved",
    note: "Cannes 발표 직후 릴리즈 예정",
  },
  {
    id: "MKT-001-02",
    projectId: "ID-001",
    kind: "main_trailer",
    label: "Main Trailer",
    durationSec: 150,
    format: "4K H.265",
    languages: ["ko", "en", "fr"],
    aiGenerated: false,
    vendor: "PRANK Studios",
    status: "in_review",
    note: "극장 + 온라인 동시",
  },
  {
    id: "MKT-001-03",
    projectId: "ID-001",
    kind: "tv_spot",
    label: "TV Spot — 15s",
    durationSec: 15,
    format: "HD 1080p 16:9",
    languages: ["ko"],
    status: "draft",
  },
  {
    id: "MKT-001-04",
    projectId: "ID-001",
    kind: "tv_spot",
    label: "TV Spot — 30s",
    durationSec: 30,
    format: "HD 1080p 16:9",
    languages: ["ko"],
    status: "draft",
  },
  {
    id: "MKT-001-05",
    projectId: "ID-001",
    kind: "teaser_poster",
    label: "Teaser Poster — Korean",
    format: "27x40 inch",
    languages: ["ko"],
    aiGenerated: true,
    vendor: "Flux Pro / PRANK",
    deliveryDate: "2026-06-20",
    status: "approved",
    note: "AI concept → PD 수정",
  },
  {
    id: "MKT-001-06",
    projectId: "ID-001",
    kind: "main_poster",
    label: "Main Poster",
    format: "27x40 inch",
    languages: ["ko", "en"],
    aiGenerated: false,
    vendor: "Mojo Supermarket",
    status: "in_review",
  },
  {
    id: "MKT-001-07",
    projectId: "ID-001",
    kind: "character_poster",
    label: "Character Posters (3종)",
    format: "27x40 inch",
    languages: ["ko"],
    aiGenerated: true,
    vendor: "Flux Pro",
    status: "in_review",
    note: "한우진 · 박서연 · 정태식",
  },
  {
    id: "MKT-001-08",
    projectId: "ID-001",
    kind: "key_art",
    label: "Key Art — Master",
    format: "Print + Digital",
    aiGenerated: true,
    vendor: "Flux Pro / PRANK",
    status: "approved",
  },
  {
    id: "MKT-001-09",
    projectId: "ID-001",
    kind: "social_asset",
    label: "Instagram Reels Pack (10)",
    format: "9:16 Vertical",
    languages: ["ko", "en"],
    aiGenerated: true,
    vendor: "Internal",
    status: "draft",
    note: "SUNO 음악 10초 클립 × 10",
  },
  // ID-002 어머니의 이력서
  {
    id: "MKT-002-01",
    projectId: "ID-002",
    kind: "teaser_poster",
    label: "Teaser Poster",
    format: "B2",
    languages: ["ko"],
    aiGenerated: false,
    status: "draft",
  },
  {
    id: "MKT-002-02",
    projectId: "ID-002",
    kind: "main_trailer",
    label: "Main Trailer",
    durationSec: 120,
    format: "HD 1080p",
    languages: ["ko"],
    status: "draft",
  },
];

export function findAssetsByProject(projectId: string): MarketingAsset[] {
  return mockMarketingAssets.filter((a) => a.projectId === projectId);
}

export function computeMarketingSummary(assets: MarketingAsset[]) {
  const total = assets.length;
  const approved = assets.filter(
    (a) => a.status === "approved" || a.status === "delivered" || a.status === "live",
  ).length;
  const inReview = assets.filter((a) => a.status === "in_review").length;
  const aiGenerated = assets.filter((a) => a.aiGenerated).length;
  const videoAssets = assets.filter((a) =>
    ["teaser_trailer", "main_trailer", "tv_spot", "international_trailer"].includes(a.kind),
  ).length;
  const imageAssets = assets.filter((a) =>
    ["teaser_poster", "main_poster", "character_poster", "international_poster", "key_art", "social_asset"].includes(a.kind),
  ).length;
  return { total, approved, inReview, aiGenerated, videoAssets, imageAssets };
}
