// Campaign visual tone guides — fed as context into the Visual Director prompt engine.
// These describe the EMOTIONAL / COMPOSITIONAL direction, NOT the rendering style.
// Rendering style (hand-drawn storyboard illustration) is fixed in visualDirector.ts.
export const VISUAL_STYLE_GUIDES = {
  "BrandFilm": "High-tension emotional narrative, protagonist silhouetted against an epic horizon, deep theatrical staging, heavy shadow contrast, quiet before the storm atmosphere",
  "ProductDemo": "Bold graphic product hero framing, athlete at peak motion frozen mid-action, explosive kinetic energy, high-contrast punchy composition, product details ultra-visible",
  "Cinematic": "Epic wide-angle environmental storytelling, lone protagonist dwarfed by vast landscape, sweeping depth of field, cinematic scale and grandeur",
  "Social": "Intimate candid human moment, close-to-subject warmth, natural ambient light flooding in, authentic unposed energy, relatable everyday scene",
  "Performance": "Split-second peak-action explosion, athlete at absolute maximum effort, sport-specific technical precision, raw physical power and velocity",
  "Testimonial": "Quiet introspective character study, direct vulnerable eye contact, intimate medium close-up, warm window light casting soft shadow, real unfiltered emotion",
  "Manifesto": "Collective cultural movement, crowd energy rising to a single figure, hero emerging from mass, iconic triumphant moment, historic scale",
  "Default": "Atmospheric brand campaign staging, strong character presence, layered compositional depth, brand-forward visual hierarchy, dramatic lighting mood"
};

export function getStyleGuideForGenre(genre) {
  return VISUAL_STYLE_GUIDES[genre] || VISUAL_STYLE_GUIDES["Default"];
}
