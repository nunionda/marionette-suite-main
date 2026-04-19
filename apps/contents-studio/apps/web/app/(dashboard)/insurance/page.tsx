import { mockInsurance } from "../../../lib/insurance/mock-entries";
import { InsuranceClient } from "./insurance-client";

export default function Page() {
  return <InsuranceClient policies={mockInsurance} />;
}
