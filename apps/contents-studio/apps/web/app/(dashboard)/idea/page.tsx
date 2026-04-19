import { mockIdeas } from "../../../lib/idea/mock-entries";
import { IdeaClient } from "./idea-client";

export default function Page() {
  return <IdeaClient ideas={mockIdeas} />;
}
