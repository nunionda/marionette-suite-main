import { MOCK_ISSUES } from "../../../lib/continuity/mock-entries";
import { ContinuityClient } from "./continuity-client";

export default function Page() {
  return <ContinuityClient issues={MOCK_ISSUES} />;
}
