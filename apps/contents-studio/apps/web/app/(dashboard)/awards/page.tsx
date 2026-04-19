import { mockAwardEntries } from "../../../lib/awards/mock-entries";
import { AwardsClient } from "./awards-client";

export default function Page() {
  return <AwardsClient entries={mockAwardEntries} />;
}
