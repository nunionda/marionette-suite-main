// ---------------------------------------------------------------------------
// MasterEditorAgent — concatenates scene video clips into a final master edit
// Port of Python src/agents/master_editor.py
// ---------------------------------------------------------------------------

import { ProductionPhase } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"
import { resolve, join } from "node:path"
import { mkdir, readdir, writeFile, unlink, stat } from "node:fs/promises"

// ─── Constants ───

/** Minimum file size (bytes) to consider a real video file, not a stub. */
const MIN_VIDEO_SIZE = 10_240 // 10 KB

// ─── Input extension ───

export interface MasterEditorInput extends AgentInput {
  inputDir?: string
  outputDir?: string
}

// ─── Agent ───

export class MasterEditorAgent extends BaseAgent {
  readonly name = "MasterEditor"
  readonly phase = ProductionPhase.POST
  readonly description =
    "Concatenates scene video clips into a single master edit using ffmpeg"

  async execute(input: MasterEditorInput): Promise<AgentOutput> {
    const { projectId, runId } = input
    const inputDir = resolve(input.inputDir ?? "output/videos")
    const outputDir = resolve(input.outputDir ?? "output/master")

    await mkdir(outputDir, { recursive: true })

    this.log("Starting ffmpeg video concatenation process...")
    await this.updateProgress(runId, 5)

    // 1. Find .mp4 files in input directory that are large enough to be real
    const videoFiles = await this.findVideoFiles(inputDir)

    if (videoFiles.length === 0) {
      this.log("No valid video files found, creating mock master edit")
      const mockPath = await this.createMockMaster(outputDir, projectId)

      await this.saveAsset({
        projectId,
        type: "VIDEO",
        agentName: this.name,
        filePath: mockPath,
        fileName: mockPath.split("/").pop() ?? "master_edit_mock.mp4",
        mimeType: "text/plain",
        metadata: { mock: true },
      })

      await this.updateProgress(runId, 100)

      return {
        success: true,
        message:
          "No real video files found. Created mock master edit placeholder.",
        outputPath: mockPath,
        data: { mock: true },
      }
    }

    this.log(`Found ${videoFiles.length} video clips to merge`)
    await this.updateProgress(runId, 20)

    // 2. Create concat.txt manifest for ffmpeg
    const concatFilePath = join(outputDir, "concat.txt")
    const concatContent = videoFiles
      .map((filePath) => `file '${filePath}'`)
      .join("\n")
    await writeFile(concatFilePath, concatContent, "utf-8")

    // 3. Run ffmpeg
    const masterPath = join(outputDir, `final_master_${projectId}.mp4`)

    try {
      await this.updateProgress(runId, 40)
      this.log("Merging video clips with ffmpeg...")

      const result = await Bun.spawn({
        cmd: [
          "ffmpeg",
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          concatFilePath,
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "23",
          "-c:a",
          "aac",
          "-movflags",
          "+faststart",
          masterPath,
        ],
        env: {
          ...process.env,
          PATH: `/opt/homebrew/bin:${process.env["HOME"]}/.bun/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${process.env["PATH"] ?? ""}`,
        },
        stdout: "ignore",
        stderr: "pipe",
      }).exited

      if (result !== 0) {
        throw new Error(`ffmpeg exited with code ${result}`)
      }

      this.log(`Master edit rendered: ${masterPath}`)

      // Save asset to DB
      const fileStats = await stat(masterPath).catch(() => null)
      await this.saveAsset({
        projectId,
        type: "VIDEO",
        agentName: this.name,
        filePath: masterPath,
        fileName: masterPath.split("/").pop() ?? "final_master.mp4",
        mimeType: "video/mp4",
        fileSize: fileStats?.size,
        metadata: {
          clipCount: videoFiles.length,
          inputDir,
        },
      })

      await this.updateProgress(runId, 100)

      return {
        success: true,
        message: `Master edit complete: merged ${videoFiles.length} clips`,
        outputPath: masterPath,
        data: {
          clipCount: videoFiles.length,
          masterPath,
        },
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.log(`ffmpeg error: ${errorMessage}`)
      this.log(
        "Ensure ffmpeg is installed (brew install ffmpeg)",
      )

      return {
        success: false,
        message: `ffmpeg concatenation failed: ${errorMessage}`,
        data: { clipCount: videoFiles.length },
      }
    } finally {
      // Clean up concat.txt
      await unlink(concatFilePath).catch(() => {
        // Ignore cleanup errors (sandbox restrictions, etc.)
      })
    }
  }

  // ── Helpers ────────────────────────────────────────────────────

  private async findVideoFiles(dir: string): Promise<string[]> {
    let entries: string[]
    try {
      entries = await readdir(dir)
    } catch {
      this.log(`Input directory not found: ${dir}`)
      return []
    }

    const mp4Files = entries
      .filter((name) => name.endsWith(".mp4"))
      .sort()

    const validFiles: string[] = []
    for (const name of mp4Files) {
      const filePath = join(dir, name)
      const fileStats = await stat(filePath).catch(() => null)
      if (fileStats && fileStats.size > MIN_VIDEO_SIZE) {
        validFiles.push(filePath)
      }
    }

    return validFiles
  }

  private async createMockMaster(
    outputDir: string,
    projectId: string,
  ): Promise<string> {
    const filename = `master_edit_${projectId}_mock.mp4`
    const filePath = join(outputDir, filename)
    const content =
      `Mock Master Edit File for project: '${projectId}'.\n` +
      `Please add real MP4 files to the videos directory.\n`
    await writeFile(filePath, content, "utf-8")
    return filePath
  }
}
