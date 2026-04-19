import { MOCK_PLANS } from "../../../lib/lighting-design/mock-entries";
import { LightingDesignClient } from "./lighting-design-client";

export default function Page() {
  return <LightingDesignClient plans={MOCK_PLANS} />;
}
