import { describe, it, expect } from 'vitest';
import { parseStoryboardFrames } from '../utils/adUtils';

describe('parseStoryboardFrames Utility', () => {
  it('parses structured storyboard text correctly', () => {
    const raw = `
[FRAME 1]
- **Visual**: A futuristic cityscape at dusk.
- **Lighting**: Neon cyan and magenta glows.
- **Camera**: Slow drone push-in.
- **Mood**: Cyberpunk, high-tech.
- **[GEN_PROMPT]**: A detailed cyberpunk city with neon lights, 8k resolution.

[FRAME 2]
- **Visual**: A close-up of the protagonist's eye.
- **Lighting**: Soft rim light.
- **Camera**: Macro lens, extreme close-up.
- **Mood**: Intense, focused.
- **[GEN_PROMPT]**: Extreme close-up of human eye with reflections, hyper-realistic.
`;
    const frames = parseStoryboardFrames(raw);
    
    expect(frames).toHaveLength(2);
    expect(frames[0].number).toBe('1');
    expect(frames[0].visual).toBe('A futuristic cityscape at dusk.');
    expect(frames[0].genPrompt).toBe('A detailed cyberpunk city with neon lights, 8k resolution.');
    expect(frames[1].camera).toBe('Macro lens, extreme close-up.');
    expect(frames[1].genPrompt).toBe('Extreme close-up of human eye with reflections, hyper-realistic.');
  });

  it('returns empty array for invalid input', () => {
    expect(parseStoryboardFrames('')).toEqual([]);
    expect(parseStoryboardFrames(null)).toEqual([]);
  });

  it('handles missing attributes gracefully', () => {
    const raw = `[FRAME 1]\n- **Visual**: Only visual here.`;
    const frames = parseStoryboardFrames(raw);
    expect(frames[0].visual).toBe('Only visual here.');
    expect(frames[0].lighting).toBe('');
  });
});
