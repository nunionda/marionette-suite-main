import { mockResearch } from "../../../lib/research/mock-entries";
import { ResearchClient } from "./research-client";

export default function Page() {
  return <ResearchClient entries={mockResearch} />;
}
