import { mockMarketingAssets } from "../../../lib/marketing/mock-entries";
import { MarketingClient } from "./marketing-client";

export default function Page() {
  return <MarketingClient assets={mockMarketingAssets} />;
}
