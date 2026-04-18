import { describe, it, expect } from 'bun:test';
import {
  makeSceneSlug,
  makeCutSlug,
  makeSceneDisplayId,
  makeCutDisplayId,
  makeAssetFilename,
  makeSceneCoverFilename,
  generateInitials,
} from './naming';

describe('makeSceneSlug', () => {
  it('zero-pads to 3 digits', () => {
    expect(makeSceneSlug(1)).toBe('sc001');
    expect(makeSceneSlug(23)).toBe('sc023');
    expect(makeSceneSlug(150)).toBe('sc150');
  });
});

describe('makeCutSlug', () => {
  it('zero-pads to 3 digits', () => {
    expect(makeCutSlug(1)).toBe('cut001');
    expect(makeCutSlug(7)).toBe('cut007');
    expect(makeCutSlug(20)).toBe('cut020');
  });
});

describe('makeSceneDisplayId', () => {
  it('combines initials and scene slug', () => {
    expect(makeSceneDisplayId('TDK', 1)).toBe('TDK_sc001');
    expect(makeSceneDisplayId('GSC', 23)).toBe('GSC_sc023');
  });
});

describe('makeCutDisplayId', () => {
  it('combines initials, scene slug, and cut slug', () => {
    expect(makeCutDisplayId('TDK', 1, 7)).toBe('TDK_sc001_cut007');
    expect(makeCutDisplayId('GSC', 23, 1)).toBe('GSC_sc023_cut001');
  });
});

describe('makeAssetFilename', () => {
  it('formats image asset filename', () => {
    expect(makeAssetFilename('TDK', 1, 7, 'img', 1, 'jpg')).toBe('TDK_sc001_cut007_img001.jpg');
  });

  it('formats video asset filename', () => {
    expect(makeAssetFilename('TDK', 1, 7, 'vid', 1, 'mp4')).toBe('TDK_sc001_cut007_vid001.mp4');
  });

  it('appends version suffix when version > 1', () => {
    expect(makeAssetFilename('TDK', 1, 7, 'img', 1, 'jpg', 2)).toBe('TDK_sc001_cut007_img001_v2.jpg');
  });
});

describe('makeSceneCoverFilename', () => {
  it('formats scene cover image filename', () => {
    expect(makeSceneCoverFilename('TDK', 1)).toBe('TDK_sc001_cover.jpg');
  });
});

describe('generateInitials', () => {
  it('takes first letter of each English word', () => {
    expect(generateInitials('The Dark Knight')).toBe('TDK');
  });

  it('handles single word', () => {
    expect(generateInitials('Parasite')).toBe('P');
  });

  it('caps at 5 characters', () => {
    expect(generateInitials('A B C D E F G').length).toBeLessThanOrEqual(5);
  });

  it('uppercases result', () => {
    expect(generateInitials('the dark knight')).toBe('TDK');
  });
});
