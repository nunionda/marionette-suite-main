/**
 * Parses raw storyboard text from the AI ART role into structured frame objects.
 * Format expected: [FRAME N] followed by bulleted attributes.
 */
export const parseStoryboardFrames = (text) => {
  if (!text) return [];
  
  const frames = [];
  // Relaxed regex to catch [FRAME N] even with timecodes or headers
  const frameRegex = /\[FRAME\s*(\d+).*?\]([\s\S]*?)(?=\[FRAME|$)/gi;
  let match;

  while ((match = frameRegex.exec(text)) !== null) {
    const number = match[1];
    const content = match[2];
    
    // Parse attributes using more flexible regex (ignoring bullets and trimming quotes)
    const frameData = {
      number,
      visual: content.match(/Visual\*\*[:\s]+(.*)/i)?.[1]?.trim() || '',
      lighting: content.match(/Lighting\*\*[:\s]+(.*)/i)?.[1]?.trim() || '',
      camera: content.match(/Camera\*\*[:\s]+(.*)/i)?.[1]?.trim() || '',
      mood: content.match(/Mood\*\*[:\s]+(.*)/i)?.[1]?.trim() || '',
      genPrompt: content.match(/\[GEN_PROMPT\]\*\*[:\s]+["']?(.*?)["']?$/im)?.[1]?.trim() || ''
    };
    frames.push(frameData);
  }
  return frames;
};
