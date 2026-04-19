import { MOCK_SESSIONS } from "../../../lib/on-set-sound/mock-entries";
import { OnSetSoundClient } from "./on-set-sound-client";

export default function Page() {
  return <OnSetSoundClient sessions={MOCK_SESSIONS} />;
}
