import { MOCK_SESSIONS } from "../../../lib/script-doctoring/mock-entries";
import { ScriptDoctoringClient } from "./script-doctoring-client";

export default function Page() {
  return <ScriptDoctoringClient sessions={MOCK_SESSIONS} />;
}
