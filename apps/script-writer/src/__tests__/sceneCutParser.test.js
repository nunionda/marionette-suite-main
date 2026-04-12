import { describe, it, expect } from 'vitest';
import { parseScreenplayToScenes } from '../utils/sceneCutParser';

const SAMPLE_SCREENPLAY = `
INT. DETECTIVE OFFICE - NIGHT

Detective PARK stares at the case files spread across his desk.

PARK
이 사건... 뭔가 빠져있어.

He picks up a photograph. A young woman, smiling.

PARK
(muttering)
누가 널 이렇게 만든 거야.

CUT TO:

EXT. DARK ALLEY - NIGHT

Rain pours down. A shadowy figure moves through the alley.

The figure stops. Looks back.

FIGURE
아무도 못 찾아.

He disappears into the darkness.

INT. POLICE STATION - DAY

Captain LEE enters, slamming the door.

LEE
박 형사, 새 증거가 나왔어.

PARK
뭔데요?

LEE
피해자 폰에서 삭제된 메시지가 복구됐어.

PARK
보여주세요.

LEE
여기.

Lee hands Park a tablet. Park's eyes widen.

PARK
이건... 범인이 내부자라는 뜻이잖아.
`.trim();

describe('parseScreenplayToScenes', () => {
  const result = parseScreenplayToScenes(SAMPLE_SCREENPLAY, {
    projectTitle: 'The Dark Case',
  });

  it('detects all 3 scenes from INT./EXT. headings', () => {
    expect(result.scenes).toHaveLength(3);
    expect(result.scenes[0].heading).toContain('DETECTIVE OFFICE');
    expect(result.scenes[1].heading).toContain('DARK ALLEY');
    expect(result.scenes[2].heading).toContain('POLICE STATION');
  });

  it('generates correct slug and displayId', () => {
    expect(result.scenes[0].slug).toBe('sc001');
    expect(result.scenes[0].displayId).toBe('TDC_sc001');
    expect(result.scenes[2].slug).toBe('sc003');
    expect(result.scenes[2].displayId).toBe('TDC_sc003');
  });

  it('extracts setting, location, timeOfDay from headings', () => {
    expect(result.scenes[0].setting).toBe('INT.');
    expect(result.scenes[0].location).toBe('DETECTIVE OFFICE');
    expect(result.scenes[0].timeOfDay).toBe('NIGHT');
    expect(result.scenes[1].setting).toBe('EXT.');
    expect(result.scenes[2].timeOfDay).toBe('DAY');
  });

  it('extracts character names', () => {
    expect(result.scenes[0].characters).toContain('PARK');
    expect(result.scenes[1].characters).toContain('FIGURE');
    expect(result.scenes[2].characters).toContain('LEE');
    expect(result.scenes[2].characters).toContain('PARK');
  });

  it('creates cuts within scenes', () => {
    // Scene 1 has a CUT TO: transition → should split into 2 cuts
    expect(result.scenes[0].cutCount).toBeGreaterThanOrEqual(1);
    // Scene 3 has extended dialogue → at least 1 cut
    expect(result.scenes[2].cutCount).toBeGreaterThanOrEqual(1);
  });

  it('generates cut displayIds with correct format', () => {
    const firstCut = result.scenes[0].cuts[0];
    expect(firstCut.displayId).toBe('TDC_sc001_cut001');
    expect(firstCut.slug).toBe('cut001');
  });

  it('calculates stats correctly', () => {
    expect(result.stats.totalScenes).toBe(3);
    expect(result.stats.totalCuts).toBeGreaterThanOrEqual(3);
    expect(result.stats.totalCharacters).toBeGreaterThanOrEqual(3); // PARK, FIGURE, LEE
  });

  it('generates act breakdown for 3-act structure', () => {
    const { actBreakdown } = result.stats;
    expect(actBreakdown.act1 + actBreakdown.act2 + actBreakdown.act3).toBe(3);
  });
});

describe('Korean format screenplay', () => {
  const KOREAN_FORMAT = `
S#1. 형사 사무실 - 밤

형수가 책상 위 서류를 뒤적인다.

형수
이건 아니야...

S#2. 골목길 - 새벽

비가 내린다. 누군가 달린다.
`.trim();

  const result = parseScreenplayToScenes(KOREAN_FORMAT, {
    projectTitle: '어둠의 추적자',
  });

  it('detects Korean scene headings (S#1, S#2)', () => {
    expect(result.scenes).toHaveLength(2);
  });

  it('generates stats for Korean screenplay', () => {
    expect(result.stats.totalScenes).toBe(2);
    expect(result.stats.totalCuts).toBeGreaterThanOrEqual(2);
  });
});
