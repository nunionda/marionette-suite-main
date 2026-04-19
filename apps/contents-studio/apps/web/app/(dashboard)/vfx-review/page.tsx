import { MOCK_SHOTS } from "../../../lib/vfx-review/mock-entries";
import { VfxReviewClient } from "./vfx-review-client";

export default function Page() {
  return <VfxReviewClient shots={MOCK_SHOTS} />;
}
