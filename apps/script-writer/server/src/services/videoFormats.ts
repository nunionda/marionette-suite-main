/**
 * Video Format Presets — YouTube 표준/숏폼 + 멀티플랫폼 해상도 기준.
 *
 * 이미지 생성(Pollinations FLUX)과 비디오 생성 모두 이 프리셋을 참조.
 * SceneDetailView 프리뷰도 이 비율에 맞춰 렌더링.
 */

export interface VideoFormatPreset {
  label: string;
  aspectRatio: string;      // CSS aspect-ratio value
  width: number;             // 이미지/비디오 생성 요청 너비
  height: number;            // 이미지/비디오 생성 요청 높이
  orientation: 'landscape' | 'portrait' | 'square';
  maxDuration?: number;      // 초 단위 최대 길이
  platform: string[];
}

export const VIDEO_FORMAT_PRESETS: Record<string, VideoFormatPreset> = {
  // ── YouTube 표준 (가로) ──
  'youtube_standard': {
    label: 'YouTube 표준 (16:9)',
    aspectRatio: '16/9',
    width: 1920, height: 1080,
    orientation: 'landscape',
    platform: ['YouTube'],
  },
  'youtube_hd': {
    label: 'YouTube HD (16:9)',
    aspectRatio: '16/9',
    width: 1280, height: 720,
    orientation: 'landscape',
    platform: ['YouTube'],
  },

  // ── YouTube Shorts (세로) ──
  'youtube_shorts': {
    label: 'YouTube Shorts (9:16)',
    aspectRatio: '9/16',
    width: 1080, height: 1920,
    orientation: 'portrait',
    maxDuration: 180,
    platform: ['YouTube Shorts', 'Instagram Reels', 'TikTok'],
  },

  // ── Instagram ──
  'instagram_reels': {
    label: 'Instagram Reels (9:16)',
    aspectRatio: '9/16',
    width: 1080, height: 1920,
    orientation: 'portrait',
    maxDuration: 900,
    platform: ['Instagram Reels'],
  },
  'instagram_feed_square': {
    label: 'Instagram Feed (1:1)',
    aspectRatio: '1/1',
    width: 1080, height: 1080,
    orientation: 'square',
    platform: ['Instagram Feed'],
  },
  'instagram_feed_portrait': {
    label: 'Instagram Feed (4:5)',
    aspectRatio: '4/5',
    width: 1080, height: 1350,
    orientation: 'portrait',
    platform: ['Instagram Feed'],
  },

  // ── TikTok ──
  'tiktok': {
    label: 'TikTok (9:16)',
    aspectRatio: '9/16',
    width: 1080, height: 1920,
    orientation: 'portrait',
    maxDuration: 600,
    platform: ['TikTok'],
  },

  // ── 영화/드라마 (시네마틱) ──
  'cinema_scope': {
    label: 'Cinemascope (2.39:1)',
    aspectRatio: '2.39/1',
    width: 2048, height: 858,
    orientation: 'landscape',
    platform: ['Cinema', 'OTT'],
  },
  'cinema_standard': {
    label: 'Cinema (1.85:1)',
    aspectRatio: '1.85/1',
    width: 1998, height: 1080,
    orientation: 'landscape',
    platform: ['Cinema', 'OTT'],
  },

  // ── TV 광고 ──
  'tv_landscape': {
    label: 'TV 광고 (16:9)',
    aspectRatio: '16/9',
    width: 1920, height: 1080,
    orientation: 'landscape',
    platform: ['TV', 'OTT'],
  },
};

/**
 * YouTube 포맷 이름 → 비디오 프리셋 자동 매핑.
 * WritingRoom의 YT_FORMAT_PRESETS 키와 매칭.
 */
export function getFormatForYouTube(formatName: string): VideoFormatPreset {
  if (formatName === 'Short-form') return VIDEO_FORMAT_PRESETS['youtube_shorts'];
  return VIDEO_FORMAT_PRESETS['youtube_standard'];
}

/**
 * 카테고리 + 포맷으로 적절한 프리셋 반환.
 */
export function getFormatForProject(category: string, format?: string, platform?: string): VideoFormatPreset {
  // YouTube
  if (category?.includes('YouTube') || category?.includes('YOUTUBE')) {
    return getFormatForYouTube(format || '');
  }
  // Commercial — 플랫폼별
  if (category?.includes('Commercial') || category?.includes('AD') || category?.includes('광고')) {
    if (platform === 'Instagram' || platform === 'TikTok') return VIDEO_FORMAT_PRESETS['youtube_shorts'];
    if (platform === 'Cinema') return VIDEO_FORMAT_PRESETS['cinema_scope'];
    return VIDEO_FORMAT_PRESETS['tv_landscape'];
  }
  // Netflix/Drama
  if (category?.includes('Netflix') || category?.includes('Drama') || category?.includes('DRAMA')) {
    return VIDEO_FORMAT_PRESETS['cinema_standard'];
  }
  // Feature Film
  if (category?.includes('Film') || category?.includes('MOVIE')) {
    return VIDEO_FORMAT_PRESETS['cinema_scope'];
  }
  // 기본값
  return VIDEO_FORMAT_PRESETS['youtube_standard'];
}

/**
 * Pollinations FLUX에서 지원하는 해상도로 클램핑.
 * FLUX는 최대 1024px 한 변, 8의 배수.
 */
export function clampToFluxResolution(preset: VideoFormatPreset): { width: number; height: number } {
  const MAX_SIDE = 1024;
  let { width, height } = preset;

  // 비율 유지하면서 최대 변을 1024로 제한
  const maxDim = Math.max(width, height);
  if (maxDim > MAX_SIDE) {
    const scale = MAX_SIDE / maxDim;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  // 8의 배수로 정렬
  width = Math.round(width / 8) * 8;
  height = Math.round(height / 8) * 8;

  return { width, height };
}
