import { mockRights } from "../../../lib/rights/mock-entries";
import { RightsClient } from "./rights-client";

export default function Page() {
  return <RightsClient entries={mockRights} />;
}
