import { mockCrew } from "../../../lib/crew/mock-entries";
import { CrewClient } from "./crew-client";

export default function Page() {
  return <CrewClient crew={mockCrew} />;
}
