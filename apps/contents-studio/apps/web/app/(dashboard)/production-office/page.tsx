import { mockProductionOffice } from "../../../lib/production-office/mock-entries";
import { ProductionOfficeClient } from "./production-office-client";

export default function Page() {
  return <ProductionOfficeClient items={mockProductionOffice} />;
}
