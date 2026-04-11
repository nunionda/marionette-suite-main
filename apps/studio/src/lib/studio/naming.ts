/** Zero-pad a number to 3 digits. */
function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

/** 'sc001', 'sc023', 'sc150' */
export function makeSceneSlug(sceneNumber: number): string {
  return `sc${pad3(sceneNumber)}`;
}

/** 'cut001', 'cut007', 'cut020' */
export function makeCutSlug(cutNumber: number): string {
  return `cut${pad3(cutNumber)}`;
}

/** 'TDK_sc001' */
export function makeSceneDisplayId(initials: string, sceneNumber: number): string {
  return `${initials}_${makeSceneSlug(sceneNumber)}`;
}

/** 'TDK_sc001_cut007' */
export function makeCutDisplayId(
  initials: string,
  sceneNumber: number,
  cutNumber: number,
): string {
  return `${initials}_${makeSceneSlug(sceneNumber)}_${makeCutSlug(cutNumber)}`;
}

/**
 * 'TDK_sc001_cut007_img001.jpg'
 * 'TDK_sc001_cut007_img001_v2.jpg' (version > 1)
 */
export function makeAssetFilename(
  initials: string,
  sceneNumber: number,
  cutNumber: number,
  assetType: 'img' | 'vid' | 'aud',
  assetIndex: number,
  ext: string,
  version = 1,
): string {
  const base = `${makeCutDisplayId(initials, sceneNumber, cutNumber)}_${assetType}${pad3(assetIndex)}`;
  const versionSuffix = version > 1 ? `_v${version}` : '';
  return `${base}${versionSuffix}.${ext}`;
}

/** 'TDK_sc001_cover.jpg' */
export function makeSceneCoverFilename(initials: string, sceneNumber: number): string {
  return `${makeSceneDisplayId(initials, sceneNumber)}_cover.jpg`;
}

/**
 * Generate project initials from title.
 * 'The Dark Knight' → 'TDK'
 * Max 5 characters.
 */
export function generateInitials(title: string): string {
  return title
    .split(/\s+/)
    .map(word => word[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 5);
}
