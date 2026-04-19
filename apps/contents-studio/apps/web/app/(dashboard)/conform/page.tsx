import { MOCK_REELS } from "../../../lib/conform/mock-entries";
import { ConformClient } from "./conform-client";

export default function Page() {
  return <ConformClient reels={MOCK_REELS} />;
}
