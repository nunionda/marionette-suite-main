import { mockEntries } from "@/lib/mock-entries";
import { LibraryClient } from "./library-client";

export default function Page() {
  return <LibraryClient entries={mockEntries} />;
}
