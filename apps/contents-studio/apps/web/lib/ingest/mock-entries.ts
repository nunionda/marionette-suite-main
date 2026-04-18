// Data Ingest module — Sprint 5 #42
// Mock data. Later: connect to file storage + DIT workflow + camera card import.

export type IngestStatus = "pending" | "ingesting" | "verified" | "rejected";
export type BackupStatus = "onset" | "studio" | "archived";

export interface FootageBatch {
  id: string;
  projectId: string; // paperclipId
  shootDate: string; // ISO yyyy-mm-dd
  shootDayId?: string; // links to Schedule's ShootDay.id
  cameraRoll: string; // e.g. "A001_C015"
  cameraModel: string; // e.g. "ARRI Alexa 35"
  codec: string; // e.g. "ARRIRAW 4.6K"
  sceneIds: string[];
  takes: number; // number of takes captured
  sizeGB: number;
  durationMin: number;
  status: IngestStatus;
  backup: BackupStatus;
  checksumVerified: boolean;
  ditOperator?: string;
  note?: string;
}

export const mockFootageBatches: FootageBatch[] = [
  // ID-001 DECODE — Day 1 wrapped (2 batches)
  {
    id: "ING-001-01",
    projectId: "ID-001",
    shootDate: "2026-05-04",
    shootDayId: "SD-001-01",
    cameraRoll: "A001",
    cameraModel: "ARRI Alexa 35",
    codec: "ARRIRAW 4.6K",
    sceneIds: ["S1", "S2", "S3"],
    takes: 47,
    sizeGB: 680,
    durationMin: 184,
    status: "verified",
    backup: "archived",
    checksumVerified: true,
    ditOperator: "김민호",
    note: "A-cam · master + coverage",
  },
  {
    id: "ING-001-02",
    projectId: "ID-001",
    shootDate: "2026-05-04",
    shootDayId: "SD-001-01",
    cameraRoll: "B001",
    cameraModel: "ARRI Alexa Mini LF",
    codec: "ProRes 4444 XQ",
    sceneIds: ["S1", "S2", "S3"],
    takes: 31,
    sizeGB: 420,
    durationMin: 124,
    status: "verified",
    backup: "archived",
    checksumVerified: true,
    ditOperator: "김민호",
    note: "B-cam · insert + close-up",
  },
  // Day 2 wrapped
  {
    id: "ING-001-03",
    projectId: "ID-001",
    shootDate: "2026-05-05",
    shootDayId: "SD-001-02",
    cameraRoll: "A002",
    cameraModel: "ARRI Alexa 35",
    codec: "ARRIRAW 4.6K",
    sceneIds: ["S4", "S5", "S6"],
    takes: 52,
    sizeGB: 720,
    durationMin: 198,
    status: "verified",
    backup: "archived",
    checksumVerified: true,
    ditOperator: "김민호",
  },
  // Day 3 in progress — partial ingest
  {
    id: "ING-001-04",
    projectId: "ID-001",
    shootDate: "2026-05-07",
    shootDayId: "SD-001-03",
    cameraRoll: "A003",
    cameraModel: "ARRI Alexa 35",
    codec: "ARRIRAW 4.6K",
    sceneIds: ["S7", "S8"],
    takes: 18,
    sizeGB: 310,
    durationMin: 88,
    status: "ingesting",
    backup: "onset",
    checksumVerified: false,
    ditOperator: "박서준",
    note: "부산 해운대 EXT · magic hour",
  },
];

export function findFootageByProject(projectId: string): FootageBatch[] {
  return mockFootageBatches.filter((b) => b.projectId === projectId);
}

export function computeIngestSummary(batches: FootageBatch[]) {
  const total = batches.length;
  const verified = batches.filter((b) => b.status === "verified").length;
  const ingesting = batches.filter((b) => b.status === "ingesting").length;
  const totalSizeGB = batches.reduce((acc, b) => acc + b.sizeGB, 0);
  const totalTakes = batches.reduce((acc, b) => acc + b.takes, 0);
  const archived = batches.filter((b) => b.backup === "archived").length;
  return { total, verified, ingesting, totalSizeGB, totalTakes, archived };
}
