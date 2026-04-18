#!/usr/bin/env bun
/**
 * Phase 5.0 codemod: replace `http://localhost:NNNN` with `process.env.X ?? "fallback"` refs.
 *
 * Usage:
 *   bun scripts/codemod-extract-urls.ts <path-to-app-or-file> [--dry]
 *
 * Skips:
 *   - log messages (heuristic: line contains console.log/print/echo/Logger)
 *   - markdown/json/yml files
 *   - node_modules, .next, dist, build, coverage directories
 *
 * Port → env var mapping (matches .env.example):
 */

const PORT_MAP: Record<string, { name: string; isPublic: boolean }> = {
  "3001": { name: "NEXT_PUBLIC_STUDIO_URL", isPublic: true },
  "3005": { name: "INTERNAL_CONTENTS_STUDIO_API_URL", isPublic: false },
  "3006": { name: "INTERNAL_SCRIPT_ENGINE_URL", isPublic: false },
  "3007": { name: "NEXT_PUBLIC_STORYBOARD_URL", isPublic: true },
  "3008": { name: "INTERNAL_SHORTS_FACTORY_BACKEND_URL", isPublic: false },
  "4000": { name: "NEXT_PUBLIC_SCENARIO_WEB_URL", isPublic: true },
  "4001": { name: "NEXT_PUBLIC_HUB_URL", isPublic: true },
  "4002": { name: "NEXT_PUBLIC_POST_STUDIO_URL", isPublic: true },
  "4003": { name: "NEXT_PUBLIC_CONTENT_LIBRARY_URL", isPublic: true },
  "4006": { name: "INTERNAL_ANALYSIS_API_URL", isPublic: false },
  "4007": { name: "NEXT_PUBLIC_ANALYSIS_WEB_URL", isPublic: true },
  "5174": { name: "NEXT_PUBLIC_SCRIPT_WRITER_URL", isPublic: true },
  "5178": { name: "NEXT_PUBLIC_SHORTS_FACTORY_URL", isPublic: true },
};

import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";

const dryRun = process.argv.includes("--dry");
const target = process.argv[2];
if (!target) {
  console.error("Usage: bun scripts/codemod-extract-urls.ts <path> [--dry]");
  process.exit(1);
}

// Skip lines that look like log/print messages (URLs there are informational, not fetch targets)
// Skip line comments (// or #) and log calls. `//` must be anchored at line start
// or after whitespace so we don't match the `//` inside `http://` URLs.
const SKIP_LINE = /(console\.(log|warn|error|info|debug)|print\s*\(|echo\s|Logger\.|logger\.|^\s*\/\/|^\s*#\s)/;
const URL_RE = /(["'`])http:\/\/localhost:(\d+)([^"'`]*)\1/g;
// Detects URLs already wrapped in `process.env.X ?? "..."` or `process.env.X || "..."`.
// Used to skip those URLs so we don't add a redundant nested fallback.
const ALREADY_ENV_RE = /process\.env\.[A-Z_][A-Z0-9_]*\s*(?:\?\?|\|\|)\s*(["'`])http:\/\/localhost:\d+[^"'`]*\1/g;

async function processFile(path: string): Promise<{ changed: number; skipped: number }> {
  const original = await readFile(path, "utf8");
  let changed = 0, skipped = 0;
  const lines = original.split("\n").map((line) => {
    if (SKIP_LINE.test(line)) return line;

    // Find ranges of URLs that are already env-fallbacks; skip those.
    const skipRanges: Array<[number, number]> = [];
    ALREADY_ENV_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ALREADY_ENV_RE.exec(line)) !== null) {
      const quote = m[1];
      const urlStart = line.indexOf(quote + "http://localhost:", m.index);
      if (urlStart >= 0) {
        const urlEnd = m.index + m[0].length;
        skipRanges.push([urlStart, urlEnd]);
      }
    }

    return line.replace(URL_RE, (full, quote, port, rest, offset) => {
      if (typeof offset === "number" && skipRanges.some(([s, e]) => offset >= s && offset < e)) {
        return full;
      }
      const mapping = PORT_MAP[port];
      if (!mapping) { skipped++; return full; }
      changed++;
      const isPython = path.endsWith(".py");
      const envExpr = isPython
        ? `os.environ.get("${mapping.name}", "http://localhost:${port}")`
        : `(process.env.${mapping.name} ?? "http://localhost:${port}")`;
      // For path suffixes (rest), wrap in template literal / f-string
      if (rest) {
        return isPython
          ? `f"{${envExpr}}${rest}"`
          : `\`\${${envExpr}}${rest}\``;
      }
      return envExpr;
    });
  });
  if (changed > 0 && !dryRun) {
    await writeFile(path, lines.join("\n"));
  }
  return { changed, skipped };
}

const glob = new Glob("**/*.{ts,tsx,js,jsx,py}");
let totalChanged = 0, totalFiles = 0;
for await (const file of glob.scan({ cwd: target, absolute: true })) {
  if (/node_modules|\.next|dist|build|coverage|\.turbo/.test(file)) continue;
  const { changed } = await processFile(file);
  if (changed > 0) {
    totalChanged += changed;
    totalFiles++;
    console.log(`${dryRun ? "[DRY]" : "[OK ]"} ${changed} replacements → ${file}`);
  }
}
console.log(`\nTotal: ${totalChanged} replacements across ${totalFiles} files${dryRun ? " (dry run)" : ""}`);
