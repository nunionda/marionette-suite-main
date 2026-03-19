// ---------------------------------------------------------------------------
// Asset types — media files produced by the pipeline
// ---------------------------------------------------------------------------

export const AssetType = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  MODEL_3D: "model_3d",
  DOCUMENT: "document",
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export interface Asset {
  id: string;
  project_id: string;
  scene_number: number | null;
  type: AssetType;
  filename: string;
  path: string;
  mime_type: string;
  size_bytes: number;
  metadata: Record<string, unknown>;
  created_at: string;
}
