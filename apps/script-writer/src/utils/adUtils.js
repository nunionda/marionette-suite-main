/**
 * Parses raw storyboard text from the AI ART role into structured frame objects.
 * Format expected: [FRAME N] or [FRAME N: PANEL NAME] followed by bulleted attributes.
 */
export const parseStoryboardFrames = (text) => {
  if (!text) return [];

  const frames = [];
  // Capture: number (groups 1,3,5,7) + optional panel title (groups 2,4,6,8) + content (group 9)
  // Handles: [FRAME 3: DAWN RISING], ### Frame 3: Dawn Rising, ** Frame 3 - Title **, Frame 3: Title
  const frameRegex = /(?:\[FRAME\s*(\d+)(?:\s*:\s*([^\]\n]+))?\]?|###\s*Frame\s*(\d+)(?:\s*:\s*([^\n]+))?|(?:\*\*|#)\s*Frame\s*(\d+)(?:\s*[:\-]\s*([^\*\n#]+))?(?:\*\*)?|Frame\s*(\d+)(?:\s*:\s*([^\n]+))?)([\s\S]*?)(?=\[FRAME|###\s*Frame|\*\*\s*Frame|Frame\s*\d+|$)/gi;

  let match;
  while ((match = frameRegex.exec(text)) !== null) {
    const number = match[1] || match[3] || match[5] || match[7];
    const panelName = (match[2] || match[4] || match[6] || match[8] || '').trim().toUpperCase();
    const content = match[9];

    const frameData = {
      number,
      panelName,  // e.g. "DAWN RISING" — used in image gen panel label
      visual: (content.match(/(?:Visual|영상|이미지)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      lighting: (content.match(/(?:Lighting|조명)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      camera: (content.match(/(?:Camera|카메라)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      mood: (content.match(/(?:Mood|분위기)\s*\*\*?\s*[:\s]+(.*)/i)?.[1] || '').trim(),
      sketchPrompt: (content.match(/\[(?:IMAGE|VIDEO|GEN)_PROMPT\]\s*\*\*?\s*[:\s]+["'\(]?(.*?)["'\)]?$/im)?.[1] ||
                     content.match(/(?:IMAGE|VIDEO|GEN)_PROMPT\s*[:\s]+(.*)/i)?.[1])?.trim() || ''
    };

    if (frameData.visual || frameData.lighting || frameData.camera || frameData.sketchPrompt) {
      frames.push(frameData);
    }
  }

  // FALLBACK: simple line-by-line split
  if (frames.length === 0 && text.length > 100) {
    const lines = text.split('\n');
    let currentFrame = null;
    lines.forEach(line => {
      const headerMatch = line.match(/Frame\s*(\d+)(?:\s*:\s*(.+))?/i);
      if (headerMatch) {
        if (currentFrame) frames.push(currentFrame);
        currentFrame = {
          number: headerMatch[1],
          panelName: (headerMatch[2] || '').trim().toUpperCase(),
          visual: '', lighting: '', camera: '', mood: '', sketchPrompt: ''
        };
      } else if (currentFrame) {
        if (line.toLowerCase().includes('visual')) currentFrame.visual = line.replace(/.*visual[:\s]*/i, '').trim();
        if (line.toLowerCase().includes('lighting')) currentFrame.lighting = line.replace(/.*lighting[:\s]*/i, '').trim();
        if (line.toLowerCase().includes('camera')) currentFrame.camera = line.replace(/.*camera[:\s]*/i, '').trim();
        if (line.toLowerCase().includes('prompt')) currentFrame.sketchPrompt = line.replace(/.*prompt[:\s]*/i, '').trim();
      }
    });
    if (currentFrame) frames.push(currentFrame);
  }

  return frames;
};
