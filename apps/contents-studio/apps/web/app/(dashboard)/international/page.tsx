import { mockIntlDeals } from "../../../lib/international/mock-entries";
import { InternationalClient } from "./international-client";

export default function Page() {
  return <InternationalClient deals={mockIntlDeals} />;
}
