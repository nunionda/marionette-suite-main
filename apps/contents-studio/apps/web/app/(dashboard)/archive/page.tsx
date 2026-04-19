import { mockArchiveAssets } from "../../../lib/archive/mock-entries";
import { ArchiveClient } from "./archive-client";

export default function Page() {
  return <ArchiveClient assets={mockArchiveAssets} />;
}
