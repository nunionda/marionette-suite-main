import { mockDCPPackages } from "../../../lib/dcp/mock-entries";
import { DCPClient } from "./dcp-client";

export default function Page() {
  return <DCPClient packages={mockDCPPackages} />;
}
