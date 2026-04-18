import { AssemblyClient } from "./assembly-client";
import { mockAssemblyJobs } from "../../../lib/assembly/mock-entries";

export default function AssemblyPage() {
  return <AssemblyClient jobs={mockAssemblyJobs} />;
}
