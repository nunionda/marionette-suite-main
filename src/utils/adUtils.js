/**
 * Parses raw storyboard text from the AI ART role into structured frame objects.
 * Format expected: [FRAME N] followed by bulleted attributes.
 */
export const parseStoryboardFrames = (text) => {
  if (!text) return [];
  
  const frames = [];
  // Much more aggressive regex to catch Frame N, [FRAME N], ### Frame N, etc.
  // Made the closing bracket for [FRAME N optional to catch Nike-style headers
  const frameRegex = /(?:\[FRAME\s*(\d+)[^\]\n]*\]?|###\s*Frame\s*(\d+)|(?:\*\*|#)\s*Frame\s*(\d+)\s*(?:\*\*|:)?|Frame\s*(\d+)\s*:?)([\s\S]*?)(?=\[FRAME|###\s*Frame|\*\*Frame|Frame\s*\d+|$)/gi;
  
  let match;
  while ((match = frameRegex.exec(text)) !== null) {
    const number = match[1] || match[2] || match[3] || match[4];
    const content = match[5];
    
    // Parse attributes using more flexible regex (look for bolded keys)
    // Removed strict end-of-line anchors and added handling for optional quotes/parentheses
    const frameData = {
      number,
      visual: (content.match(/(?:Visual|영상|이미지)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      lighting: (content.match(/(?:Lighting|조명)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      camera: (content.match(/(?:Camera|카메라)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      mood: (content.match(/(?:Mood|분위기)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      sketchPrompt: (content.match(/\[(?:IMAGE|VIDEO|GEN)_PROMPT\]\s*\*\*?\s*[:\s]+["'\(]?(.*?)["'\)]?$/im)?.[1] || 
                     content.match(/(?:IMAGE|VIDEO|GEN)_PROMPT\s*[:\s]+(.*)/i)?.[1])?.trim() || ''
    };
    
    // Only push if we have at least visual or some content
    if (frameData.visual || frameData.lighting || frameData.camera || frameData.sketchPrompt) {
      frames.push(frameData);
    }
  }
  
  // FALLBACK: If regex fails but we have text, try simple split
  if (frames.length === 0 && text.length > 100) {
    const lines = text.split('\n');
    let currentFrame = null;
    lines.forEach(line => {
      if (line.match(/Frame\s*(\d+)/i)) {
        if (currentFrame) frames.push(currentFrame);
        currentFrame = { number: line.match(/(\d+)/)[1], visual: '', lighting: '', camera: '', mood: '', sketchPrompt: '' };
      } else if (currentFrame) {
        if (line.toLowerCase().includes('visual')) currentFrame.visual = line.replace(/.*visual[:\s]*/i, '');
        if (line.toLowerCase().includes('lighting')) currentFrame.lighting = line.replace(/.*lighting[:\s]*/i, '');
        if (line.toLowerCase().includes('camera')) currentFrame.camera = line.replace(/.*camera[:\s]*/i, '');
        if (line.toLowerCase().includes('prompt')) currentFrame.sketchPrompt = line.replace(/.*prompt[:\s]*/i, '');
      }
    });
    if (currentFrame) frames.push(currentFrame);
  }

  return frames;
};
