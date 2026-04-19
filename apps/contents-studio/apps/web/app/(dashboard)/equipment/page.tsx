import { mockEquipment } from "../../../lib/equipment/mock-entries";
import { EquipmentClient } from "./equipment-client";

export default function Page() {
  return <EquipmentClient equipment={mockEquipment} />;
}
