import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { LibraryEntry } from "@marionette/types-content";

const DATA_FILE = path.join(process.cwd(), "data", "promoted-entries.json");

async function ensureFile(): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await readFile(DATA_FILE);
  } catch {
    await writeFile(DATA_FILE, "[]", "utf-8");
  }
}

export async function readPromoted(): Promise<LibraryEntry[]> {
  await ensureFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as LibraryEntry[];
}

export async function appendPromoted(entry: LibraryEntry): Promise<void> {
  const entries = await readPromoted();
  // Replace existing entry for the same projectId, or append
  const idx = entries.findIndex((e) => e.projectId === entry.projectId);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}
