/**
 * Gallery API — shared module for all gallery pages.
 *
 * Connects gallery generation modals to the storyboard-concept-maker HTTP API (:3007).
 * When embedded in ProductionDeck iframe, posts results back to parent React app.
 */

const STORYBOARD_API = (process.env.NEXT_PUBLIC_STORYBOARD_URL ?? "http://localhost:3007");

const CONCEPT_ENDPOINTS = {
  character:   '/api/character',
  environment: '/api/environment',
  set:         '/api/environment',   // set uses environment endpoint
  costume:     '/api/costume',
  props:       '/api/props',
  storyboard:  '/api/generate',
  sfx_makeup:  '/api/character',     // closest match until dedicated endpoint
};

/**
 * Generate concept art via storyboard-concept-maker API.
 *
 * @param {string} type - One of: character, environment, set, costume, props, storyboard, sfx_makeup
 * @param {Object} opts
 * @param {string} opts.description - What to generate
 * @param {string} [opts.style] - Artist style key (e.g. 'bong', 'kurosawa')
 * @param {string} [opts.pose] - Pose/action description
 * @param {string} [opts.mood] - Mood description
 * @param {string} [opts.project] - Project title
 * @param {string} [opts.camera] - Camera angle (for storyboard type)
 * @param {string} [opts.location] - Location (for storyboard type)
 * @returns {Promise<Object>} API response with { success, path, url, type }
 */
async function generateConcept(type, opts = {}) {
  const endpoint = CONCEPT_ENDPOINTS[type];
  if (!endpoint) {
    throw new Error(`Unknown concept type: ${type}`);
  }

  const isStoryboard = type === 'storyboard';
  const body = isStoryboard
    ? {
        scene: opts.description || '',
        style: opts.style || 'bong',
        project: opts.project || 'Untitled',
        camera_angle: opts.camera || opts.pose || 'medium shot',
        mood: opts.mood || 'neutral',
        location: opts.location || '',
      }
    : {
        description: [
          opts.description || '',
          opts.pose ? `Pose: ${opts.pose}.` : '',
          opts.mood ? `Mood: ${opts.mood}.` : '',
        ].filter(Boolean).join(' '),
        style: opts.style || 'bong',
        project: opts.project || 'Untitled',
      };

  const res = await fetch(`${STORYBOARD_API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  // Construct image URL if path is returned without url
  if (data.success && data.path && !data.url) {
    const filename = data.path.split('/').pop();
    data.url = `${STORYBOARD_API}/output/${filename}`;
  }

  // Notify parent React app if embedded in iframe
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'gallery-generation-result',
      payload: {
        ...data,
        conceptType: type,
        style: opts.style || 'bong',
        description: opts.description || '',
      },
    }, '*');
  }

  return data;
}

/**
 * Show a generated image in the gallery viewer.
 * Called after successful generation to display result inline.
 */
function showGeneratedImage(imageUrl, label) {
  const mainImage = document.getElementById('mainImage');
  const placeholder = document.getElementById('viewerPlaceholder');
  if (mainImage && imageUrl) {
    mainImage.src = imageUrl;
    mainImage.alt = label || 'Generated concept';
    mainImage.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  }
}
