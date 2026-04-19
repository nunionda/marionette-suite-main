import { mockQCChecks } from "../../../lib/qc/mock-entries";
import { QCClient } from "./qc-client";

export default function Page() {
  return <QCClient checks={mockQCChecks} />;
}
