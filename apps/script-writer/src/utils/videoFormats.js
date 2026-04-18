/**
 * Video Format Presets (프론트엔드용)
 * 서버의 videoFormats.ts와 동일한 프리셋.
 * SceneDetailView 프리뷰 사이즈와 WritingRoom 포맷 선택에 사용.
 */

export const VIDEO_FORMAT_PRESETS = {
  youtube_standard:       { label: 'YouTube 표준 (16:9)',     aspectRatio: '16/9',    orientation: 'landscape', width: 1920, height: 1080 },
  youtube_hd:             { label: 'YouTube HD (16:9)',       aspectRatio: '16/9',    orientation: 'landscape', width: 1280, height: 720  },
  youtube_shorts:         { label: 'YouTube Shorts (9:16)',   aspectRatio: '9/16',    orientation: 'portrait',  width: 1080, height: 1920 },
  instagram_reels:        { label: 'Instagram Reels (9:16)',  aspectRatio: '9/16',    orientation: 'portrait',  width: 1080, height: 1920 },
  instagram_feed_square:  { label: 'Instagram (1:1)',         aspectRatio: '1/1',     orientation: 'square',    width: 1080, height: 1080 },
  instagram_feed_portrait:{ label: 'Instagram (4:5)',         aspectRatio: '4/5',     orientation: 'portrait',  width: 1080, height: 1350 },
  tiktok:                 { label: 'TikTok (9:16)',           aspectRatio: '9/16',    orientation: 'portrait',  width: 1080, height: 1920 },
  cinema_scope:           { label: 'Cinemascope (2.39:1)',    aspectRatio: '2.39/1',  orientation: 'landscape', width: 2048, height: 858  },
  cinema_standard:        { label: 'Cinema (1.85:1)',         aspectRatio: '1.85/1',  orientation: 'landscape', width: 1998, height: 1080 },
  tv_landscape:           { label: 'TV 광고 (16:9)',          aspectRatio: '16/9',    orientation: 'landscape', width: 1920, height: 1080 },
};

/**
 * YouTube WritingRoom 포맷 → 비디오 프리셋 매핑
 */
export function getFormatForYouTube(formatName) {
  if (formatName === 'Short-form') return VIDEO_FORMAT_PRESETS.youtube_shorts;
  return VIDEO_FORMAT_PRESETS.youtube_standard;
}

/**
 * 카테고리 + 포맷으로 프리셋 반환
 */
export function getFormatForProject(category, format, platform) {
  if (category?.includes('YouTube') || category?.includes('YOUTUBE')) {
    return getFormatForYouTube(format || '');
  }
  if (category?.includes('Commercial') || category?.includes('AD')) {
    if (platform === 'Instagram' || platform === 'TikTok') return VIDEO_FORMAT_PRESETS.youtube_shorts;
    if (platform === 'Cinema') return VIDEO_FORMAT_PRESETS.cinema_scope;
    return VIDEO_FORMAT_PRESETS.tv_landscape;
  }
  if (category?.includes('Netflix') || category?.includes('Drama') || category?.includes('DRAMA')) {
    return VIDEO_FORMAT_PRESETS.cinema_standard;
  }
  if (category?.includes('Film') || category?.includes('MOVIE')) {
    return VIDEO_FORMAT_PRESETS.cinema_scope;
  }
  return VIDEO_FORMAT_PRESETS.youtube_standard;
}

/**
 * 프리뷰 컨테이너 사이즈 계산
 * orientation에 따라 maxWidth/maxHeight 반환
 */
export function getPreviewSize(preset) {
  if (!preset) return { maxWidth: '480px', maxHeight: '280px', aspectRatio: '16/9' };

  if (preset.orientation === 'portrait') {
    return { maxWidth: '240px', maxHeight: '420px', aspectRatio: preset.aspectRatio };
  }
  if (preset.orientation === 'square') {
    return { maxWidth: '360px', maxHeight: '360px', aspectRatio: preset.aspectRatio };
  }
  // landscape
  return { maxWidth: '480px', maxHeight: '280px', aspectRatio: preset.aspectRatio };
}
