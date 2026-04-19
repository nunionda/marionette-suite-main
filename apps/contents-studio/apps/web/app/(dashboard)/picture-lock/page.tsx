import { MOCK_VERSIONS } from "../../../lib/picture-lock/mock-entries";
import { PictureLockClient } from "./picture-lock-client";

export default function Page() {
  return <PictureLockClient versions={MOCK_VERSIONS} />;
}
