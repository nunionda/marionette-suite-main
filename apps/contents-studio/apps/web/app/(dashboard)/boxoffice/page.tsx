import { BoxOfficeClient } from "./boxoffice-client";
import {
  mockBoxOfficeReports,
  mockReleaseMeta,
} from "../../../lib/boxoffice/mock-entries";

export default function BoxOfficePage() {
  return (
    <BoxOfficeClient reports={mockBoxOfficeReports} releases={mockReleaseMeta} />
  );
}
