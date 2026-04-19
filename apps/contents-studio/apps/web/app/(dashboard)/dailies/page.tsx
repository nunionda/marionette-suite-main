import { MOCK_SESSIONS } from "../../../lib/dailies/mock-entries";
import { DailiesClient } from "./dailies-client";

export default function Page() {
  return <DailiesClient sessions={MOCK_SESSIONS} />;
}
