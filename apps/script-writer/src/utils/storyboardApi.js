/**
 * Storyboard Concept Maker API Client
 *
 * Connects to the 10 Masters storyboard generation server (port 3007)
 * for Production Design track nodes:
 *   - Character Design → /api/character
 *   - Set Design → /api/environment
 *   - Costume Design → /api/costume
 *   - Props → /api/props
 *   - Storyboard → /api/generate
 */

const STORYBOARD_API = import.meta.env.VITE_STORYBOARD_API_URL || 'http://localhost:3007';

/**
 * Check if storyboard server is available.
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${STORYBOARD_API}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get available artist styles and format styles.
 */
export async function getStyles() {
  const res = await fetch(`${STORYBOARD_API}/api/styles`);
  return res.json();
}

/**
 * Generate a single storyboard frame.
 */
export async function generateFrame({ scene, style = 'bong', format, project, cameraAngle, mood, characters, location }) {
  const res = await fetch(`${STORYBOARD_API}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scene,
      style,
      format: format || undefined,
      project: project || 'Untitled',
      camera_angle: cameraAngle || 'medium shot',
      mood: mood || 'neutral',
      characters: characters || [],
      location: location || '',
    }),
  });
  return res.json();
}

/**
 * Generate multiple storyboard frames in batch.
 */
export async function generateBatch({ scenes, style = 'bong', format, project }) {
  const res = await fetch(`${STORYBOARD_API}/api/generate/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenes,
      style,
      format: format || undefined,
      project: project || 'Untitled',
    }),
  });
  return res.json();
}

/**
 * Generate character concept sheet.
 */
export async function generateCharacter({ description, style = 'bong', project }) {
  const res = await fetch(`${STORYBOARD_API}/api/character`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, style, project }),
  });
  return res.json();
}

/**
 * Generate environment/set concept art.
 */
export async function generateEnvironment({ description, style = 'bong', project }) {
  const res = await fetch(`${STORYBOARD_API}/api/environment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, style, project }),
  });
  return res.json();
}

/**
 * Generate costume design concept.
 */
export async function generateCostume({ description, style = 'bong', project }) {
  const res = await fetch(`${STORYBOARD_API}/api/costume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, style, project }),
  });
  return res.json();
}

/**
 * Generate props design concept.
 */
export async function generateProps({ description, style = 'bong', project }) {
  const res = await fetch(`${STORYBOARD_API}/api/props`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, style, project }),
  });
  return res.json();
}

/**
 * Map Production Design node IDs to API functions.
 */
export const NODE_API_MAP = {
  character_design: generateCharacter,
  set_design: generateEnvironment,
  costume_design: generateCostume,
  props: generateProps,
  storyboard: generateFrame,
};

/**
 * Execute a Production Design node via the storyboard API.
 */
export async function executeDesignNode(nodeId, { description, style, project }) {
  const apiFn = NODE_API_MAP[nodeId];
  if (!apiFn) throw new Error(`No API mapping for node: ${nodeId}`);
  return apiFn({ description, style, project });
}
