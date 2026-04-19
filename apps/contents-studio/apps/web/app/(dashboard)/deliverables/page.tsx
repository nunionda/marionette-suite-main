import { MOCK_DELIVERABLES } from "../../../lib/deliverables/mock-entries";
import { DeliverablesClient } from "./deliverables-client";

export default function Page() {
  return <DeliverablesClient deliverables={MOCK_DELIVERABLES} />;
}
