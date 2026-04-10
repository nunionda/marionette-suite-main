// ---------------------------------------------------------------------------
// MasteringAgent — elevates produced assets to 4K cinematic quality
// Part of the Autopilot / YOLO industrialization sequence
// ---------------------------------------------------------------------------

import { ProductionPhase, AssetType } from "@marionette/shared"
import { BaseAgent } from "../base/agent.js"
import type { AgentInput, AgentOutput } from "../base/agent.js"
import { stat } from "node:fs/promises"

export interface MasteringInput extends AgentInput {
  assetId: string; // The specific 2K asset to master
  targetResolution?: "4K" | "8K";
  styleRefinement?: boolean;
}

export class MasteringAgent extends BaseAgent {
  readonly name = "Mastering"
  readonly phase = ProductionPhase.POST
  readonly description = "Elevates assets to 4K/8K resolution using high-integrity AI upscaling"

  async execute(input: MasteringInput): Promise<AgentOutput> {
    const { assetId, projectId, runId } = input
    const targetRes = input.targetResolution ?? "4K"
    
    this.log(`Initiating mastering for asset: ${assetId} -> Target: ${targetRes}`)
    await this.updateProgress(runId, 10)

    // 1. Fetch the source asset
    const sourceAsset = await this.db.asset.findUnique({
      where: { id: assetId }
    })

    if (!sourceAsset) {
      return {
        success: false,
        message: `Source asset ${assetId} not found in Vault.`,
      }
    }

    this.log(`Source identified: ${sourceAsset.fileName} (${sourceAsset.type})`)
    await this.updateProgress(runId, 30)

    try {
      // 2. Determine scaling method based on asset type
      let masteredUrl: string = ""
      const isVideo = sourceAsset.type === "VIDEO"

      this.log(`Calling AI Gateway for ${targetRes} mastering...`)
      
      // In a real scenario, we call the gateway's mastering/upscale tool
      // For this implementation, we use the gateway's media enhancement capabilities
      const result = await this.gateway.master({
        inputUrl: sourceAsset.filePath, // Or public URL if cloud-synced
        type: sourceAsset.type,
        targetResolution: targetRes,
        enhanceDetail: true
      })

      masteredUrl = result.url
      this.log(`Mastering complete: ${masteredUrl}`)
      await this.updateProgress(runId, 80)

      // 3. Save the new Master Asset to the Vault
      const masterAsset = await this.saveAsset({
        projectId,
        type: sourceAsset.type as any,
        agentName: this.name,
        filePath: masteredUrl,
        fileName: `MASTER_${targetRes}_${sourceAsset.fileName}`,
        mimeType: sourceAsset.mimeType,
        sceneNumber: sourceAsset.sceneNumber ?? undefined,
        metadata: {
          originalAssetId: sourceAsset.id,
          resolution: targetRes,
          masteringEngine: "Real-ESRGAN-Cinematic",
          masteredAt: new Date().toISOString()
        }
      })

      this.log(`Master Asset ${masterAsset.id} persisted to Vault.`)
      await this.updateProgress(runId, 100)

      return {
        success: true,
        message: `Successfully mastered ${sourceAsset.fileName} to ${targetRes}`,
        outputPath: masteredUrl,
        data: {
          masterAssetId: masterAsset.id,
          resolution: targetRes,
          url: masteredUrl
        }
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.log(`Mastering failed: ${msg}`)
      return {
        success: false,
        message: `Mastering failed: ${msg}`,
      }
    }
  }
}
