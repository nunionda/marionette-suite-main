import { mockSalesDeals } from "../../../lib/sales/mock-entries";
import { SalesClient } from "./sales-client";

export default function Page() {
  return <SalesClient deals={mockSalesDeals} />;
}
