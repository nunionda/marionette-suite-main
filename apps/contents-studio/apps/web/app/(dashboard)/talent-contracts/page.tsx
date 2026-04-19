import { mockTalentContracts } from "../../../lib/talent-contracts/mock-entries";
import { TalentContractsClient } from "./talent-contracts-client";

export default function Page() {
  return <TalentContractsClient contracts={mockTalentContracts} />;
}
