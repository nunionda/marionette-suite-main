import { MOCK_SESSIONS } from "../../../lib/final-mix/mock-entries";
import { FinalMixClient } from "./final-mix-client";

export default function Page() {
  return <FinalMixClient sessions={MOCK_SESSIONS} />;
}
