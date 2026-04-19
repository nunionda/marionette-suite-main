/**
 * Marketing engine composition root — reuses the cinema singleton.
 *
 * MarketingOrchestrator wraps CinemaOrchestrator (plan §B engines), so the
 * marketing layer shares the same element store, job queue, and provider
 * fallback chain. We register one additional job type here:
 * `marketing:campaign` that runs `generateCampaign()` with N variants
 * sequentially and stashes each variant's URL as it completes.
 */
import "server-only";

import {
  createMarketingOrchestrator,
  type AdStyleId,
  type MarketingOrchestrator,
  type MarketingPlatform,
  type ProductBrief,
} from "@marionette/engine-marketing";
import { getCinemaEngine } from "../cinema/engine";

interface MarketingRegistry {
  marketing: MarketingOrchestrator;
}

declare global {
  // eslint-disable-next-line no-var
  var __marionetteMarketing: MarketingRegistry | undefined;
}

export interface CampaignJobInput {
  product: ProductBrief;
  style: AdStyleId;
  platform: MarketingPlatform;
  avatarElementId?: string;
  extraElementIds?: string[];
  variants?: number;
  durationSec?: number;
  extraPrompt?: string;
  preferProvider?: string;
}

export interface CampaignJobOutput {
  providerId: string;
  variants: Array<{
    index: number;
    nodeId: string;
    videoUrl?: string;
  }>;
}

function build(): MarketingRegistry {
  const cinema = getCinemaEngine();
  const marketing = createMarketingOrchestrator(cinema.cinema);

  cinema.queue.register<CampaignJobInput, CampaignJobOutput>(
    "marketing:campaign",
    async (input, ctx) => {
      ctx.reportProgress(0.05, "planning variants");
      const shots = marketing.plan(input);
      const total = shots.length;
      const results: CampaignJobOutput["variants"] = [];
      let providerId = "";

      for (let i = 0; i < total; i++) {
        const shot = shots[i]!;
        ctx.reportProgress(
          0.05 + (0.9 * i) / total,
          `rendering variant ${i + 1}/${total}`,
        );
        const { result, providerId: pid, nodeId } =
          await cinema.cinema.generateShot(shot);
        providerId = pid;
        const video = result.videos[0];
        results.push({
          index: i,
          nodeId,
          videoUrl: video?.kind === "url" ? video.url : undefined,
        });
      }

      ctx.reportProgress(0.98, "done");
      return { providerId, variants: results };
    },
  );

  return { marketing };
}

export function getMarketingEngine(): MarketingRegistry {
  if (!globalThis.__marionetteMarketing) {
    globalThis.__marionetteMarketing = build();
  }
  return globalThis.__marionetteMarketing;
}
