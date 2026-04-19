import { MOCK_SHOTS } from "../../../lib/vfx-previs/mock-entries";
import { VfxPrevisClient } from "./vfx-previs-client";

export default function Page() {
  return <VfxPrevisClient shots={MOCK_SHOTS} />;
}
