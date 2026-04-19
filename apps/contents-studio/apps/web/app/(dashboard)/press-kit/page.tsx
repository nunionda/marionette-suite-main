import { mockPressAssets } from "../../../lib/press-kit/mock-entries";
import { PressKitClient } from "./press-kit-client";

export default function Page() {
  return <PressKitClient assets={mockPressAssets} />;
}
