import { mockLocations } from "../../../lib/locations/mock-entries";
import { LocationsClient } from "./locations-client";

export default function Page() {
  return <LocationsClient locations={mockLocations} />;
}
