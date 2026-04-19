#!/usr/bin/env bun
/**
 * Smoke test for @marionette/ai-providers (Sprint 11a + 11b).
 *
 * Probes every registered provider for the chosen capability, sends ONE tiny
 * generate call to each provider that reports `ready`, and prints results.
 * `missing-key` and `unreachable` are expected in partial environments and do
 * NOT fail the script.
 *
 * Usage:
 *   bun run scripts/smoke-test-providers.ts                       # text (default)
 *   bun run scripts/smoke-test-providers.ts --capability image
 *   bun run scripts/smoke-test-providers.ts --capability image --prefer nano-banana-2
 *
 * Image outputs are written to `./tmp/smoke-{providerId}.png` so you can open
 * them in Finder / Preview to eyeball quality.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import {
  getHealthMatrix,
  listAudioProviders,
  listImageProviders,
  listTextProviders,
  listVideoProviders,
  listVoiceCloneProviders,
  resolveAudioProvider,
  resolveImageProvider,
  resolveTextProvider,
  resolveVideoProvider,
  resolveVoiceCloneProvider,
  type ProviderHealth,
} from "../packages/ai-providers/src/index";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function healthIcon(h: ProviderHealth): string {
  switch (h.state) {
    case "ready":
      return `${c.green}✓ ready${c.reset}`;
    case "missing-key":
      return `${c.yellow}🔑 missing: ${h.requiredEnv.join(",")}${c.reset}`;
    case "unreachable":
      return `${c.red}✗ ${h.error}${c.reset}`;
    case "rate-limited":
      return `${c.blue}⏱ backoff${c.reset}`;
    case "unknown":
      return `${c.gray}· unknown${c.reset}`;
  }
}

type SmokeCapability = "text" | "image" | "video" | "audio" | "voice-clone";

function parseArgs(argv: string[]) {
  const out: { capability: SmokeCapability; prefer?: string; noGen?: boolean } = {
    capability: "text",
  };
  const valid: SmokeCapability[] = ["text", "image", "video", "audio", "voice-clone"];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--capability" && argv[i + 1]) {
      const v = argv[++i]!;
      if (!valid.includes(v as SmokeCapability)) {
        console.error(`Unsupported capability: ${v}. Valid: ${valid.join(", ")}`);
        process.exit(1);
      }
      out.capability = v as SmokeCapability;
    } else if (a === "--prefer" && argv[i + 1]) {
      out.prefer = argv[++i];
    } else if (a === "--no-gen") {
      out.noGen = true;
    }
  }
  return out;
}

async function runText(prefer?: string): Promise<number> {
  const matrix = await getHealthMatrix("text");
  printMatrix(matrix);
  const ready = matrix.filter((e) => e.health.state === "ready");
  if (ready.length === 0) {
    printNoReadyHint(["GOOGLE_AI_STUDIO_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY"]);
    return 1;
  }

  console.log(`${c.bold}── Generate smoke (text)${c.reset}\n`);
  let success = 0;
  for (const { meta } of ready) {
    const provider = listTextProviders().find((p) => p.meta.id === meta.id)!;
    process.stdout.write(`  → ${meta.id.padEnd(42)} `);
    try {
      const start = Date.now();
      const result = await provider.generate({
        system: "You are terse.",
        messages: [{ role: "user", content: "Say 'marionette ready' and nothing else." }],
        maxTokens: 32,
        temperature: 0,
        timeoutMs: 30_000,
      });
      const elapsed = Date.now() - start;
      const preview = result.text.trim().replace(/\n/g, " ").slice(0, 80);
      console.log(`${c.green}✓${c.reset} ${elapsed}ms · ${c.dim}${preview}${c.reset}`);
      success++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${c.red}✗ ${msg.slice(0, 100)}${c.reset}`);
    }
  }
  console.log();

  console.log(`${c.bold}── resolveTextProvider${prefer ? ` (prefer=${prefer})` : ""}${c.reset}\n`);
  try {
    const picked = await resolveTextProvider(prefer);
    console.log(`  Selected: ${c.green}${picked.meta.id}${c.reset} (${picked.meta.tier})`);
  } catch (e) {
    console.log(`  ${c.red}No healthy: ${e instanceof Error ? e.message : e}${c.reset}`);
  }
  console.log();

  summary(ready.length, matrix.length, success);
  return success > 0 ? 0 : 1;
}

async function runImage(prefer?: string): Promise<number> {
  const matrix = await getHealthMatrix("image");
  printMatrix(matrix);
  const ready = matrix.filter((e) => e.health.state === "ready");
  if (ready.length === 0) {
    printNoReadyHint([
      "GOOGLE_AI_STUDIO_KEY (Nano Banana 2)",
      "HF_TOKEN (FLUX.1 dev)",
      "A1111_BASE_URL / COMFY_BASE_URL (local)",
    ]);
    return 1;
  }

  console.log(`${c.bold}── Generate smoke (image)${c.reset}\n`);
  const outDir = resolvePath(process.cwd(), "tmp");
  await mkdir(outDir, { recursive: true });

  let success = 0;
  for (const { meta } of ready) {
    const provider = listImageProviders().find((p) => p.meta.id === meta.id)!;
    process.stdout.write(`  → ${meta.id.padEnd(42)} `);
    try {
      const start = Date.now();
      const result = await provider.generate({
        prompt: "A minimalist neon-lit ribbon spelling 'MARIONETTE' on black background, studio lighting, 3d render",
        aspectRatio: "1:1",
        width: 512,
        height: 512,
        steps: 20,
        count: 1,
        timeoutMs: 120_000,
      });
      const elapsed = Date.now() - start;
      const first = result.images[0];
      if (!first) {
        console.log(`${c.yellow}· no image returned${c.reset}`);
        continue;
      }
      let outPath = "";
      if (first.kind === "bytes") {
        const ext = first.mime.split("/")[1] ?? "png";
        outPath = resolvePath(outDir, `smoke-${meta.id}.${ext}`);
        await writeFile(outPath, first.bytes);
      } else {
        outPath = `(url) ${first.url}`;
      }
      console.log(`${c.green}✓${c.reset} ${elapsed}ms · ${c.dim}${outPath}${c.reset}`);
      success++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${c.red}✗ ${msg.slice(0, 120)}${c.reset}`);
    }
  }
  console.log();

  console.log(`${c.bold}── resolveImageProvider${prefer ? ` (prefer=${prefer})` : ""}${c.reset}\n`);
  try {
    const picked = await resolveImageProvider(prefer);
    console.log(`  Selected: ${c.green}${picked.meta.id}${c.reset} (${picked.meta.tier})`);
  } catch (e) {
    console.log(`  ${c.red}No healthy: ${e instanceof Error ? e.message : e}${c.reset}`);
  }
  console.log();

  summary(ready.length, matrix.length, success);
  return success > 0 ? 0 : 1;
}

function printMatrix(matrix: { meta: { id: string; tier: string }; health: ProviderHealth }[]) {
  console.log(`Registered providers: ${matrix.length}`);
  console.log(`${c.dim}${"─".repeat(80)}${c.reset}`);
  for (const { meta, health } of matrix) {
    console.log(`  [${meta.tier.padEnd(5)}] ${meta.id.padEnd(42)} ${healthIcon(health)}`);
  }
  console.log();
}

function printNoReadyHint(suggestions: string[]) {
  console.log(`${c.yellow}No providers in 'ready' state. Consider:${c.reset}`);
  for (const s of suggestions) console.log(`  · ${s}`);
}

function summary(ready: number, total: number, success: number) {
  console.log(`${c.bold}── Summary${c.reset}`);
  console.log(`  Ready:   ${ready}/${total}`);
  console.log(`  Success: ${success}/${ready}`);
}

async function runVideo(prefer?: string, noGen?: boolean): Promise<number> {
  const matrix = await getHealthMatrix("video");
  printMatrix(matrix);
  const ready = matrix.filter((e) => e.health.state === "ready");
  if (ready.length === 0) {
    printNoReadyHint([
      "FAL_KEY (Seedance 2.0)",
      "KLING_ACCESS_KEY + KLING_SECRET_KEY (Kling 3.0)",
      "HF_TOKEN (Hunyuan/Wan/LTX)",
    ]);
    return 1;
  }

  if (noGen) {
    console.log(
      `${c.dim}(--no-gen: skipping submit/poll; video generation takes minutes)${c.reset}\n`,
    );
    try {
      const picked = await resolveVideoProvider(prefer);
      console.log(`  Resolve: ${c.green}${picked.meta.id}${c.reset} (${picked.meta.tier})`);
    } catch (e) {
      console.log(`  ${c.red}No healthy: ${e instanceof Error ? e.message : e}${c.reset}`);
    }
    summary(ready.length, matrix.length, ready.length);
    return 0;
  }

  console.log(`${c.bold}── Generate smoke (video — submit + poll)${c.reset}\n`);
  let success = 0;
  for (const { meta } of ready) {
    const provider = listVideoProviders().find((p) => p.meta.id === meta.id)!;
    process.stdout.write(`  → ${meta.id.padEnd(42)} `);
    try {
      const start = Date.now();
      const submission = await provider.submit({
        prompt: "A paper marionette bows on an empty theater stage, warm spotlight, slow dolly in",
        durationSec: 5,
        camera: { aspectRatio: "16:9" },
        quality: "draft",
        timeoutMs: 60_000,
      });
      const submittedMs = Date.now() - start;
      process.stdout.write(
        `${c.green}submitted${c.reset} ${submittedMs}ms · jobId=${submission.jobId.slice(0, 20)}… `,
      );
      // Single poll to validate wire — full completion can take 2-10 minutes.
      const status = await provider.poll(submission.jobId);
      console.log(`${c.dim}[state=${status.state}]${c.reset}`);
      success++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${c.red}✗ ${msg.slice(0, 120)}${c.reset}`);
    }
  }
  console.log();

  console.log(`${c.bold}── resolveVideoProvider${prefer ? ` (prefer=${prefer})` : ""}${c.reset}\n`);
  try {
    const picked = await resolveVideoProvider(prefer);
    console.log(`  Selected: ${c.green}${picked.meta.id}${c.reset} (${picked.meta.tier})`);
  } catch (e) {
    console.log(`  ${c.red}No healthy: ${e instanceof Error ? e.message : e}${c.reset}`);
  }
  console.log();

  summary(ready.length, matrix.length, success);
  return success > 0 ? 0 : 1;
}

async function runAudio(prefer?: string): Promise<number> {
  const matrix = await getHealthMatrix("audio");
  printMatrix(matrix);
  const ready = matrix.filter((e) => e.health.state === "ready");
  if (ready.length === 0) {
    printNoReadyHint([
      "ELEVENLABS_API_KEY (v3 TTS)",
      "XTTS_BASE_URL (Coqui local)",
      "PIPER_BASE_URL (Piper local)",
    ]);
    return 1;
  }

  console.log(`${c.bold}── Generate smoke (audio — TTS)${c.reset}\n`);
  const outDir = resolvePath(process.cwd(), "tmp");
  await mkdir(outDir, { recursive: true });

  let success = 0;
  for (const { meta } of ready) {
    const provider = listAudioProviders().find((p) => p.meta.id === meta.id)!;
    process.stdout.write(`  → ${meta.id.padEnd(42)} `);
    try {
      const start = Date.now();
      const result = await provider.generate({
        text: "Marionette audio provider layer is ready.",
        format: "mp3",
        timeoutMs: 60_000,
      });
      const elapsed = Date.now() - start;
      let outPath = "";
      if (result.audio.kind === "bytes") {
        const ext = result.audio.mime.split("/")[1]?.replace("mpeg", "mp3") ?? "mp3";
        outPath = resolvePath(outDir, `smoke-${meta.id}.${ext}`);
        await writeFile(outPath, result.audio.bytes);
      } else {
        outPath = `(url) ${result.audio.url}`;
      }
      console.log(`${c.green}✓${c.reset} ${elapsed}ms · ${c.dim}${outPath}${c.reset}`);
      success++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${c.red}✗ ${msg.slice(0, 120)}${c.reset}`);
    }
  }
  console.log();

  try {
    const picked = await resolveAudioProvider(prefer);
    console.log(`  Resolve: ${c.green}${picked.meta.id}${c.reset} (${picked.meta.tier})`);
  } catch (e) {
    console.log(`  ${c.red}No healthy: ${e instanceof Error ? e.message : e}${c.reset}`);
  }
  console.log();

  summary(ready.length, matrix.length, success);
  return success > 0 ? 0 : 1;
}

async function runVoiceClone(prefer?: string): Promise<number> {
  const matrix = await getHealthMatrix("voice-clone");
  printMatrix(matrix);
  const ready = matrix.filter((e) => e.health.state === "ready");
  if (ready.length === 0) {
    printNoReadyHint(["ELEVENLABS_API_KEY (IVC/PVC)"]);
    return 1;
  }
  console.log(
    `${c.bold}── Voice clone smoke — listing trained voices only (training is an action, not idempotent)${c.reset}\n`,
  );
  let success = 0;
  for (const { meta } of ready) {
    const provider = listVoiceCloneProviders().find((p) => p.meta.id === meta.id)!;
    process.stdout.write(`  → ${meta.id.padEnd(42)} `);
    try {
      const voices = await provider.list();
      console.log(
        `${c.green}✓${c.reset} ${voices.length} trained voice(s)${
          voices.length ? " · " + c.dim + voices.slice(0, 3).map((v) => v.name).join(", ") + c.reset : ""
        }`,
      );
      success++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${c.red}✗ ${msg.slice(0, 120)}${c.reset}`);
    }
  }
  console.log();

  try {
    const picked = await resolveVoiceCloneProvider(prefer);
    console.log(`  Resolve: ${c.green}${picked.meta.id}${c.reset} (${picked.meta.tier})`);
  } catch (e) {
    console.log(`  ${c.red}No healthy: ${e instanceof Error ? e.message : e}${c.reset}`);
  }
  console.log();
  summary(ready.length, matrix.length, success);
  return success > 0 ? 0 : 1;
}

async function main() {
  const { capability, prefer, noGen } = parseArgs(process.argv.slice(2));
  console.log(
    `${c.bold}── Marionette AI Providers · Smoke Test · capability=${capability}${c.reset}\n`,
  );
  let code: number;
  switch (capability) {
    case "text":
      code = await runText(prefer);
      break;
    case "image":
      code = await runImage(prefer);
      break;
    case "video":
      code = await runVideo(prefer, noGen);
      break;
    case "audio":
      code = await runAudio(prefer);
      break;
    case "voice-clone":
      code = await runVoiceClone(prefer);
      break;
  }
  process.exit(code);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
