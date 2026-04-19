import { mockPitches } from "../../../lib/pitch/mock-entries";
import { PitchClient } from "./pitch-client";

export default function Page() {
  return <PitchClient pitches={mockPitches} />;
}
