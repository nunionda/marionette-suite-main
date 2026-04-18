import { mockTitleCards } from "../../../lib/titles/mock-entries";
import { TitlesClient } from "./titles-client";

export default function Page() {
  return <TitlesClient cards={mockTitleCards} />;
}
