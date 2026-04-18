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
    expect(frames[0].sketchPrompt).toBe('A detailed cyberpunk city with neon lights, 8k resolution.');
    const complexRaw = `
### **[FRAME 1: 0-3s] - Attention**
- **Visual**: 슬로우 모션. 테니스 공이 라켓 스위트 스팟에 정확히 맞는 순간.
- **Lighting**: 역광. 실루엣 강조.
- **Camera**: 초고속 촬영.
- **Mood**: 강렬, 압도적.
- **[GEN_PROMPT]**: "Extreme Slow motion of a tennis ball hitting a racket, backlight, high-speed camera, detailed texture, dramatic lighting, tension, hyper-realistic."
`;
    const complexFrames = parseStoryboardFrames(complexRaw);
    expect(complexFrames).toHaveLength(1);
    expect(complexFrames[0].number).toBe('1');
    expect(complexFrames[0].sketchPrompt).toBe('Extreme Slow motion of a tennis ball hitting a racket, backlight, high-speed camera, detailed texture, dramatic lighting, tension, hyper-realistic.');
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
