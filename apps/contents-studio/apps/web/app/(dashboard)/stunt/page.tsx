import { MOCK_SEQUENCES } from "../../../lib/stunt/mock-entries";
import { StuntClient } from "./stunt-client";

export default function Page() {
  return <StuntClient sequences={MOCK_SEQUENCES} />;
}
