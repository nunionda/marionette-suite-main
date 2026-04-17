import { mockEntries } from "@/lib/mock-entries";
import { readPromoted } from "@/lib/promoted-store";
import { LibraryClient } from "./library-client";

export default async function Page() {
  const promoted = await readPromoted();
  // Promoted entries override mock entries for the same projectId
  const promotedIds = new Set(promoted.map((e) => e.projectId));
  const base = mockEntries.filter((e) => !promotedIds.has(e.projectId));
  const entries = [...base, ...promoted];

  return <LibraryClient entries={entries} />;
}
