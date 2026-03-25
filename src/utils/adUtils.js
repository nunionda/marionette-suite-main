/**
 * Parses raw storyboard text from the AI ART role into structured frame objects.
 * Format expected: [FRAME N] followed by bulleted attributes.
 */
export const parseStoryboardFrames = (text) => {
  if (!text) return [];
  
  const frames = [];
  const frameRegex = /\[FRAME\s+(\d+)\](?:\s+\*\*(.*?)\*\*)?([\s\S]*?)(?=\[FRAME|$)/gi;
  let match;

  while ((match = frameRegex.exec(text)) !== null) {
    const number = match[1];
    const content = match[3];
    
    // Parse attributes using regex
    const frameData = {
      number,
      visual: content.match(/- \*\*Visual\*\*: (.*)/)?.[1] || '',
      lighting: content.match(/- \*\*Lighting\*\*: (.*)/)?.[1] || '',
      camera: content.match(/- \*\*Camera\*\*: (.*)/)?.[1] || '',
      mood: content.match(/- \*\*Mood\*\*: (.*)/)?.[1] || '',
      genPrompt: content.match(/- \*\*\[GEN_PROMPT\]\*\*: (.*)/)?.[1] || ''
    };
    frames.push(frameData);
  }
  return frames;
};
