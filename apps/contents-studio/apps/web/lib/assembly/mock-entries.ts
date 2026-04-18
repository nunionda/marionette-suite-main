// Final Video Assembly module — Sprint 0.5/5 (Charter #58)
// Mock data. Later: actual ffmpeg invocation + on-disk job store.
//
// The assembly stage produces master files from the edit timeline + final
// sound mix + color grade. Each AssemblyJob captures:
//   - source components (video track, audio tracks, VFX count)
//   - output spec (codec, container, HDR, audio, resolution)
//   - progress / output path / checksum
//   - ffmpeg command that would produce it (stored for audit)

export type AssemblyStatus = "queued" | "running" | "done" | "failed";

export type AssemblyPreset =
  | "4K-DolbyVision-Atmos" // premium streaming master
  | "1080p-HDR10-5.1" // broadcast master
  | "720p-SDR-Stereo" // web/social master
  | "2K-DCP" // cinema 2K
  | "4K-DCP" // cinema 4K
  | "IMF-Netflix" // Netflix IMF package
  | "ProRes-Broadcast"; // ProRes for broadcast delivery

export type Codec = "h264" | "h265" | "av1" | "prores" | "dnxhr";
export type Container = "mp4" | "mov" | "mxf" | "mkv";
export type ColorSpace = "rec709" | "rec2020" | "dci-p3";
export type HDRFormat = "sdr" | "hdr10" | "dolby_vision";
export type AudioFormat = "stereo" | "5_1" | "atmos";
export type Resolution = "720p" | "1080p" | "2K" | "4K";

export interface AssemblyJob {
  id: string;
  projectId: string; // paperclipId
  version: string; // "v1.0" | "v1.1-color-pass" | "final"
  status: AssemblyStatus;
  preset: AssemblyPreset;

  // Source components that go into this assembly
  videoTrackId: string; // e.g. "edit-v23-graded"
  audioTrackIds: string[]; // e.g. ["dialog-final", "music-final", "sfx-final"]
  vfxShotsIncluded: number;

  // Output spec
  codec: Codec;
  container: Container;
  colorSpace: ColorSpace;
  hdr: HDRFormat;
  audioFormat: AudioFormat;
  resolution: Resolution;

  // Progress
  durationSec: number;
  renderedSec: number;

  // Output (populated when status === "done")
  outputPath?: string;
  outputSizeGB?: number;
  checksumSHA256?: string;

  // Timestamps
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;

  // The actual ffmpeg command that produced / would produce this output.
  // Stored for audit + reproducibility.
  ffmpegCommand?: string;
}

export const mockAssemblyJobs: AssemblyJob[] = [
  // ID-001 DECODE — full ladder of masters for theatrical + streaming + broadcast
  {
    id: "ASM-001-01",
    projectId: "ID-001",
    version: "v1.0-final",
    status: "done",
    preset: "4K-DolbyVision-Atmos",
    videoTrackId: "edit-v47-graded",
    audioTrackIds: ["dialog-final", "music-final", "sfx-final", "foley-final"],
    vfxShotsIncluded: 247,
    codec: "h265",
    container: "mov",
    colorSpace: "rec2020",
    hdr: "dolby_vision",
    audioFormat: "atmos",
    resolution: "4K",
    durationSec: 8520, // 142 min
    renderedSec: 8520,
    outputPath: "/exports/DECODE-v1.0-4K-DV-Atmos.mov",
    outputSizeGB: 182.4,
    checksumSHA256: "a3b8f2e1c9d4...",
    startedAt: "2026-04-10T02:00:00Z",
    completedAt: "2026-04-10T08:47:00Z",
    ffmpegCommand: "ffmpeg -i timeline.edl -c:v libx265 -x265-params 'colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc:master-display=...' -c:a eac3 -b:a 768k -map 0 out.mov",
  },
  {
    id: "ASM-001-02",
    projectId: "ID-001",
    version: "v1.0-final",
    status: "done",
    preset: "IMF-Netflix",
    videoTrackId: "edit-v47-graded",
    audioTrackIds: ["dialog-final", "music-final", "sfx-final", "foley-final"],
    vfxShotsIncluded: 247,
    codec: "h265",
    container: "mxf",
    colorSpace: "rec2020",
    hdr: "dolby_vision",
    audioFormat: "atmos",
    resolution: "4K",
    durationSec: 8520,
    renderedSec: 8520,
    outputPath: "/exports/DECODE-Netflix-IMF.mxf",
    outputSizeGB: 254.8,
    checksumSHA256: "e7c9d4a3b8f2...",
    startedAt: "2026-04-10T09:00:00Z",
    completedAt: "2026-04-10T18:32:00Z",
    ffmpegCommand: "ffmpeg -i timeline.edl -f mxf_opatom [Netflix IMF spec]",
  },
  {
    id: "ASM-001-03",
    projectId: "ID-001",
    version: "v1.0-final",
    status: "done",
    preset: "4K-DCP",
    videoTrackId: "edit-v47-graded",
    audioTrackIds: ["dialog-final", "music-final", "sfx-final", "foley-final"],
    vfxShotsIncluded: 247,
    codec: "prores",
    container: "mov",
    colorSpace: "dci-p3",
    hdr: "sdr",
    audioFormat: "5_1",
    resolution: "4K",
    durationSec: 8520,
    renderedSec: 8520,
    outputPath: "/exports/DECODE-DCP-4K.mov",
    outputSizeGB: 512.0,
    checksumSHA256: "b2d7e8a1f5c6...",
    startedAt: "2026-04-11T00:00:00Z",
    completedAt: "2026-04-11T14:22:00Z",
    ffmpegCommand: "ffmpeg -i timeline.edl -c:v prores_ks -profile:v 3 -c:a pcm_s24le out.mov",
  },
  {
    id: "ASM-001-04",
    projectId: "ID-001",
    version: "v1.0-social",
    status: "running",
    preset: "720p-SDR-Stereo",
    videoTrackId: "edit-v47-graded",
    audioTrackIds: ["dialog-final", "music-final", "sfx-final", "foley-final"],
    vfxShotsIncluded: 247,
    codec: "h264",
    container: "mp4",
    colorSpace: "rec709",
    hdr: "sdr",
    audioFormat: "stereo",
    resolution: "720p",
    durationSec: 8520,
    renderedSec: 4260, // 50% progress
    startedAt: "2026-04-18T12:00:00Z",
    ffmpegCommand: "ffmpeg -i master-4K.mov -vf scale=1280:720 -c:v libx264 -c:a aac -b:a 192k out.mp4",
  },
  // ID-002 — no assembly yet, in post-production
  {
    id: "ASM-002-01",
    projectId: "ID-002",
    version: "v0.3-rough",
    status: "queued",
    preset: "1080p-HDR10-5.1",
    videoTrackId: "edit-v12-ungraded",
    audioTrackIds: ["dialog-rough", "music-sketch"],
    vfxShotsIncluded: 8,
    codec: "h265",
    container: "mp4",
    colorSpace: "rec709",
    hdr: "sdr",
    audioFormat: "5_1",
    resolution: "1080p",
    durationSec: 6480, // 108 min
    renderedSec: 0,
  },
];

export function findAssemblyJobsByProject(projectId: string): AssemblyJob[] {
  return mockAssemblyJobs
    .filter((j) => j.projectId === projectId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function computeAssemblySummary(jobs: AssemblyJob[]) {
  const total = jobs.length;
  const done = jobs.filter((j) => j.status === "done").length;
  const running = jobs.filter((j) => j.status === "running").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const queued = jobs.filter((j) => j.status === "queued").length;
  const mastered = done; // at least one done master exists

  const totalSizeGB = jobs
    .filter((j) => j.status === "done" && j.outputSizeGB != null)
    .reduce((acc, j) => acc + (j.outputSizeGB ?? 0), 0);

  // Overall render progress (avg across running+done)
  const inFlight = jobs.filter((j) => j.status === "running" || j.status === "done");
  const pctOverall = inFlight.length === 0
    ? 0
    : Math.round(
        (inFlight.reduce(
          (acc, j) => acc + (j.durationSec > 0 ? j.renderedSec / j.durationSec : 0),
          0,
        ) / inFlight.length) * 100,
      );

  return {
    total,
    done,
    running,
    failed,
    queued,
    mastered,
    totalSizeGB: Math.round(totalSizeGB * 10) / 10,
    pctOverall,
    presetsDelivered: Array.from(
      new Set(jobs.filter((j) => j.status === "done").map((j) => j.preset)),
    ),
  };
}
