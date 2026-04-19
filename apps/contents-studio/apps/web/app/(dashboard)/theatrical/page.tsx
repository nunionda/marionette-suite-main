import { mockTheatricalReleases } from "../../../lib/theatrical/mock-entries";
import { TheatricalClient } from "./theatrical-client";

export default function Page() {
  return <TheatricalClient releases={mockTheatricalReleases} />;
}
