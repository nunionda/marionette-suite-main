import type { ContentCategory, ContentProfile } from "@marionette/pipeline-core";
import { filmProfile } from "./film";
import { dramaProfile } from "./drama";
import { commercialProfile } from "./commercial";
import { youtubeProfile } from "./youtube";

export const profiles: Record<ContentCategory, ContentProfile> = {
  film: filmProfile,
  drama: dramaProfile,
  commercial: commercialProfile,
  youtube: youtubeProfile,
};

export function getProfile(category: ContentCategory): ContentProfile {
  return profiles[category];
}

export { filmProfile, dramaProfile, commercialProfile, youtubeProfile };
