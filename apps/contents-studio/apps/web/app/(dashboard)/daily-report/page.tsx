import { mockDailyReports } from "../../../lib/daily-report/mock-entries";
import { DailyReportClient } from "./daily-report-client";

export default function Page() {
  return <DailyReportClient reports={mockDailyReports} />;
}
