import { mockContracts } from "../../../lib/contracts/mock-entries";
import { ContractsClient } from "./contracts-client";

export default function Page() {
  return <ContractsClient contracts={mockContracts} />;
}
