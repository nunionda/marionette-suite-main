import { MOCK_DOCS } from "../../../lib/script-supervisor-prep/mock-entries";
import { ScriptSupervisorPrepClient } from "./script-supervisor-prep-client";

export default function Page() {
  return <ScriptSupervisorPrepClient docs={MOCK_DOCS} />;
}
