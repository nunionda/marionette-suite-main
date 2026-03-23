import type { ScriptElement } from '../../script/infrastructure/parser';
import type { MarketLocale } from '../../shared/MarketConfig';
import type { VFXRequirement, VFXTier } from '../domain/ProductionBreakdown';

// ─── VFX Keywords (EN + KO) ───

const VFX_KEYWORDS_EN = [
  'explosion', 'explode', 'crash', 'fly', 'flying', 'flies',
  'transform', 'alien', 'creature', 'underwater', 'space',
  'destroy', 'destruction', 'hologram', 'fire', 'flood',
  'earthquake', 'monster', 'dragon', 'magic', 'laser',
  'portal', 'teleport', 'spaceship', 'robot', 'cyborg',
  'superhero', 'morph', 'invisible', 'vanish', 'levitate',
  'tornado', 'hurricane', 'meteor', 'collapse', 'shatter',
  'ghost', 'spirit', 'glow', 'beam', 'shield', 'force field',
];

const VFX_KEYWORDS_KO = [
  '폭발', '충돌', '비행', '날아오르', '변신', '외계인', '괴물',
  '수중', '우주선', '파괴', '홀로그램', '불길', '화염', '불꽃', '홍수',
  '지진', '마법', '레이저', '포탈', '순간이동',
  '로봇', '슈퍼히어로', '투명인간', '떠오르',
  '태풍', '폭풍', '운석', '붕괴', '산산조각',
  '유령', '방패', '결계',
];

// ─── Keyword → Tier Mapping ───

const VFX_TIER_MAP: Record<string, VFXTier> = {
  // Complex (80-200hrs): large-scale simulation, creature work
  creature: 'complex', dragon: 'complex', monster: 'complex',
  alien: 'complex', flood: 'complex', earthquake: 'complex',
  tornado: 'complex', hurricane: 'complex', meteor: 'complex',
  spaceship: 'complex', cyborg: 'complex', morph: 'complex',
  transform: 'complex',
  '변신': 'complex', '괴물': 'complex', '외계인': 'complex',
  '홍수': 'complex', '지진': 'complex', '우주선': 'complex',
  '태풍': 'complex', '운석': 'complex',

  // Moderate (40-80hrs): 3D assets, environment extension
  explosion: 'moderate', explode: 'moderate',
  destroy: 'moderate', destruction: 'moderate', collapse: 'moderate',
  fire: 'moderate', hologram: 'moderate', portal: 'moderate',
  teleport: 'moderate', shield: 'moderate', 'force field': 'moderate',
  robot: 'moderate', superhero: 'moderate', magic: 'moderate',
  '폭발': 'moderate', '파괴': 'moderate', '붕괴': 'moderate',
  '홀로그램': 'moderate', '포탈': 'moderate', '마법': 'moderate',
  '로봇': 'moderate', '슈퍼히어로': 'moderate', '순간이동': 'moderate',
  '불길': 'moderate', '화염': 'moderate', '폭풍': 'moderate',

  // Simple (20-40hrs): compositing, wire removal
  fly: 'simple', flying: 'simple', flies: 'simple',
  crash: 'simple', shatter: 'simple', ghost: 'simple',
  spirit: 'simple', glow: 'simple', beam: 'simple',
  invisible: 'simple', vanish: 'simple', levitate: 'simple',
  laser: 'simple', space: 'simple', underwater: 'simple',
  '비행': 'simple', '날아오르': 'simple', '충돌': 'simple',
  '유령': 'simple', '불꽃': 'simple',
  '투명인간': 'simple', '떠오르': 'simple',
  '레이저': 'simple', '수중': 'simple',
  '산산조각': 'simple', '방패': 'simple', '결계': 'simple',
};

// ─── Tier Modifiers ───

const AMPLIFIERS = [
  'massive', 'huge', 'giant', 'enormous', 'army of', 'hundreds', 'thousands',
  'full-scale', 'large-scale', 'epic', 'catastrophic', 'overwhelming',
  '거대한', '대규모', '수백', '수천', '엄청난', '대형', '전면적',
];

const DIMINISHERS = [
  'small', 'brief', 'slight', 'tiny', 'subtle', 'faint', 'minor', 'quick',
  '작은', '잠깐', '살짝', '미세한', '약간', '희미한',
];

const TIER_HOURS: Record<VFXTier, number> = {
  none: 0,
  simple: 30,
  moderate: 60,
  complex: 140,
};

const TIER_ORDER: VFXTier[] = ['none', 'simple', 'moderate', 'complex'];

function tierIndex(tier: VFXTier): number {
  return TIER_ORDER.indexOf(tier);
}

function higherTier(a: VFXTier, b: VFXTier): VFXTier {
  return tierIndex(a) >= tierIndex(b) ? a : b;
}

function upgradeTier(tier: VFXTier): VFXTier {
  const idx = tierIndex(tier);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1]! : tier;
}

function downgradeTier(tier: VFXTier): VFXTier {
  const idx = tierIndex(tier);
  return idx > 0 ? TIER_ORDER[idx - 1]! : tier;
}

// ─── Deterministic VFX Tier Classification ───

function classifyActionLine(text: string, keywords: string[]): { tier: VFXTier; hours: number } {
  const lower = text.toLowerCase();

  // Find the highest tier among matched keywords
  let maxTier: VFXTier = 'none';
  for (const kw of keywords) {
    if (lower.includes(kw) && VFX_TIER_MAP[kw]) {
      maxTier = higherTier(maxTier, VFX_TIER_MAP[kw]!);
    }
  }

  if (maxTier === 'none') {
    return { tier: 'none', hours: 0 };
  }

  // Apply amplifier/diminisher modifiers
  if (AMPLIFIERS.some(a => lower.includes(a))) {
    maxTier = upgradeTier(maxTier);
  }
  if (DIMINISHERS.some(d => lower.includes(d))) {
    maxTier = downgradeTier(maxTier);
  }

  return { tier: maxTier, hours: TIER_HOURS[maxTier] };
}

// ─── Public API (no LLM dependency) ───

export class VFXEstimator {
  estimate(scriptId: string, elements: ScriptElement[], market: MarketLocale = 'hollywood'): {
    requirements: VFXRequirement[];
    complexityScore: number;
  } {
    const keywords = [...VFX_KEYWORDS_EN, ...(market === 'korean' ? VFX_KEYWORDS_KO : [])];
    let currentScene = 0;
    const requirements: VFXRequirement[] = [];

    for (const el of elements) {
      if (el.type === 'scene_heading') {
        currentScene++;
        continue;
      }
      if (el.type === 'action') {
        const lower = el.text.toLowerCase();
        if (keywords.some(kw => lower.includes(kw))) {
          const { tier, hours } = classifyActionLine(el.text, keywords);
          if (tier !== 'none') {
            requirements.push({
              sceneNumber: currentScene || 1,
              description: el.text.slice(0, 200),
              tier,
              estimatedHours: hours,
            });
          }
        }
      }
    }

    // Compute complexity score
    const sceneCount = elements.filter(e => e.type === 'scene_heading').length || 1;
    const tierWeights: Record<VFXTier, number> = { none: 0, simple: 1, moderate: 3, complex: 5 };
    const weightedSum = requirements.reduce((s, r) => s + (tierWeights[r.tier] || 0), 0);
    const complexityScore = Math.min(100, Math.round((weightedSum / sceneCount) * 20));

    return { requirements, complexityScore };
  }
}
