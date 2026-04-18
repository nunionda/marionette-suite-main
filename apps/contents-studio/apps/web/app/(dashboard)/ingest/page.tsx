import { mockFootageBatches } from "../../../lib/ingest/mock-entries";
import { IngestClient } from "./ingest-client";

export default function Page() {
  return <IngestClient batches={mockFootageBatches} />;
}
