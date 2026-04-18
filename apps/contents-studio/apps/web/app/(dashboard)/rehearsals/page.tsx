import { mockRehearsals } from "../../../lib/rehearsals/mock-entries";
import { RehearsalsClient } from "./rehearsals-client";

export default function Page() {
  return <RehearsalsClient sessions={mockRehearsals} />;
}
