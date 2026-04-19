import { MOCK_SHOOT_DAYS } from "../../../lib/photography/mock-entries";
import { PhotographyClient } from "./photography-client";

export default function Page() {
  return <PhotographyClient days={MOCK_SHOOT_DAYS} />;
}
