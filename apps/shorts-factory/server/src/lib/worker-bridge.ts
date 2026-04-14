/**
 * worker-bridge.ts
 * Spawns Python worker processes for heavy media tasks (download, FFmpeg render).
 * Uses Bun.spawn — non-blocking, stdout/stderr piped to console.
 */

import path from "path";

const WORKER_DIR = path.resolve(import.meta.dir, "../../../worker");
const API_BASE = "http://localhost:3008";

// Use /usr/bin/env to resolve python3 via the shell's PATH — avoids Bun's
// posix_spawn limitation with multi-level symlinks (e.g. Homebrew Python).
const ENV = "/usr/bin/env";
const PYTHON_ENV_ARG = process.env.PYTHON3_PATH ?? "python3";

function spawnPython(script: string, args: string[]): void {
  const proc = Bun.spawn([ENV, PYTHON_ENV_ARG, path.join(WORKER_DIR, script), ...args], {
    cwd: WORKER_DIR,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, SHORTS_API_BASE: API_BASE, PATH: process.env.PATH ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin" },
  });

  // Stream stdout/stderr to console with a prefix
  const prefix = `[${script}]`;
  (async () => {
    for await (const chunk of proc.stdout) {
      process.stdout.write(`${prefix} ${Buffer.from(chunk).toString()}`);
    }
  })().catch(() => {});
  (async () => {
    for await (const chunk of proc.stderr) {
      process.stderr.write(`${prefix} ${Buffer.from(chunk).toString()}`);
    }
  })().catch(() => {});
}

/** Fire-and-forget: download a YouTube video via yt-dlp. */
export async function triggerDownload(assetId: number, videoId: string): Promise<void> {
  spawnPython("downloader.py", [String(assetId), videoId]);
}

/** Fire-and-forget: render a clip via FFmpeg. */
export async function triggerRender(renderJobId: number): Promise<void> {
  spawnPython("worker.py", ["render", String(renderJobId)]);
}
