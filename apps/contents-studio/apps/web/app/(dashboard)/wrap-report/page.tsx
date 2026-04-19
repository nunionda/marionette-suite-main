import { mockWrapReports } from "../../../lib/wrap-report/mock-entries";
import { WrapReportClient } from "./wrap-report-client";

export default function Page() {
  return <WrapReportClient reports={mockWrapReports} />;
}
