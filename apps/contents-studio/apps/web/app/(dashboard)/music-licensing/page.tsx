import { mockMusicLicenses } from "../../../lib/music-licensing/mock-entries";
import { MusicLicensingClient } from "./music-licensing-client";

export default function Page() {
  return <MusicLicensingClient licenses={mockMusicLicenses} />;
}
