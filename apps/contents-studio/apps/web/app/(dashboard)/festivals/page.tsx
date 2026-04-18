import { mockFestivalEntries } from "../../../lib/festivals/mock-entries";
import { FestivalsClient } from "./festivals-client";

export default function Page() {
  return <FestivalsClient entries={mockFestivalEntries} />;
}
