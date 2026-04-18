/**
 * File-based Paperclip project registry.
 *
 * Phase 1: reads from ~/paperclip/projects-registry.json.
 * Phase 2 will swap for real HTTP calls to the Paperclip :3100 server.
 *
 * Ownership: Paperclip HQ writes this file. Marionette Suite only reads.
 */
import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import type { StudioCode } from "@marionette/pipeline-core";

const REGISTRY_PATH = path.join(homedir(), "paperclip", "projects-registry.json");

export interface PaperclipRegistryEntry {
  id: string;
  title: string;
  genre: string;
  category: "film" | "drama" | "commercial" | "youtube";
  budgetKRW: number;
  priority: "P0" | "P1" | "P2";
  ownerStudio: StudioCode;
}

let _cache: { entries: PaperclipRegistryEntry[]; mtime: number } | null = null;

export async function readRegistry(): Promise<PaperclipRegistryEntry[]> {
  try {
    const raw = await readFile(REGISTRY_PATH, "utf-8");
    const entries = JSON.parse(raw) as PaperclipRegistryEntry[];
    _cache = { entries, mtime: Date.now() };
    return entries;
  } catch (err) {
    console.warn("[paperclip-bridge] registry unavailable:", (err as Error).message);
    return _cache?.entries ?? [];
  }
}

export async function findProject(
  id: string,
): Promise<PaperclipRegistryEntry | undefined> {
  const entries = await readRegistry();
  return entries.find((e) => e.id === id);
}

export function getRegistryPath(): string {
  return REGISTRY_PATH;
}
