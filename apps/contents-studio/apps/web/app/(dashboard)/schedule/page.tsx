import { mockShootDays } from "../../../lib/schedule/mock-entries";
import { ScheduleClient } from "./schedule-client";

export default function Page() {
  return <ScheduleClient days={mockShootDays} />;
}
