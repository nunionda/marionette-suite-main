import { PostStudioClient } from "./post-studio-client";
import {
  mockProjects,
  mockEditCuts,
  mockVFXShots,
  mockSoundReels,
  mockColorReels,
  mockDeliveries,
} from "../../../lib/post/mock-data";

export default function Page() {
  return (
    <PostStudioClient
      projects={mockProjects}
      edit={mockEditCuts}
      vfx={mockVFXShots}
      sound={mockSoundReels}
      color={mockColorReels}
      delivery={mockDeliveries}
    />
  );
}
