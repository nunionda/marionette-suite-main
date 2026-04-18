import { mockCastings } from "../../../lib/casting/mock-entries";
import { CastingClient } from "./casting-client";

export default function Page() {
  return <CastingClient entries={mockCastings} />;
}
