import { mockFinancing } from "../../../lib/financing/mock-entries";
import { FinancingClient } from "./financing-client";

export default function Page() {
  return <FinancingClient entries={mockFinancing} />;
}
