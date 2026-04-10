export const VISUAL_STYLE_GUIDES = {
  "BrandFilm": "High-contrast cinematic, anamorphic lens, moody and dramatic lighting, Arri Alexa 65, film grain",
  "ProductDemo": "Bright, punchy colors, energetic dynamic composition, clean commercial lighting, crisp foreground details, macro lens",
  "Cinematic": "Epic cinematic masterpiece, sweeping landscapes, heavy color grading, evocative lighting, 35mm film look",
  "Social": "Authentic, UGC style, iPhone 14 Pro camera, natural daylight, candid and approachable lifestyle aesthetic",
  "Manifesto": "Epic cinematic masterpiece, sweeping landscapes, emotionally heavy color grading, evocative lighting",
  "Default": "Professional Agency Storyboard, Cinematic masterpiece, gorgeous lighting, premium editorial style"
};

export function getStyleGuideForGenre(genre) {
  return VISUAL_STYLE_GUIDES[genre] || VISUAL_STYLE_GUIDES["Default"];
}
