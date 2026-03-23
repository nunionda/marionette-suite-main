import type { ScriptElement } from "../../script/infrastructure/parser";
import type { MarketLocale } from "../../shared/MarketConfig";
import { TROPE_DICTIONARY } from "../data/filmCatalog";
import { KOREAN_TROPE_DICTIONARY } from "../data/koreanTropeDictionary";

export interface TropeResult {
  scriptId: string;
  tropes: string[];
}

// ─── Hollywood Trope Keyword Clusters ───

const TROPE_KEYWORDS: Record<string, string[]> = {
  'Anti-Hero': ['criminal', 'outlaw', 'reluctant', 'dark past', 'ruthless', 'morally', 'vigilante', 'antihero', 'anti-hero', 'corrupt', 'mercenary'],
  'Heist': ['steal', 'rob', 'robbery', 'vault', 'heist', 'break in', 'security', 'getaway', 'loot', 'safe', 'crew assembl', 'con artist'],
  'Time Travel': ['time travel', 'time machine', 'past', 'future', 'paradox', 'timeline', 'loop', 'back in time', 'flux', 'temporal'],
  'Coming of Age': ['teenager', 'adolescent', 'school', 'prom', 'graduate', 'grow up', 'first time', 'young', 'youth', 'childhood', 'innocence', 'puberty'],
  'Buddy Comedy': ['buddy', 'partner', 'duo', 'mismatched', 'odd couple', 'unlikely pair', 'team up', 'bickering', 'road trip'],
  'Twist Ending': ['reveal', 'truth is', 'actually', 'not what it seems', 'turns out', 'all along', 'secret identity', 'been lying', 'hidden truth'],
  'Revenge': ['revenge', 'avenge', 'vengeance', 'retaliation', 'payback', 'retribution', 'get back at', 'make them pay', 'settle the score'],
  'Chosen One': ['destiny', 'prophecy', 'chosen', 'the one', 'special power', 'fate', 'foretold', 'savior', 'fulfil'],
  'Fish Out of Water': ['new town', 'stranger', 'outsider', 'doesn\'t belong', 'foreign', 'out of place', 'culture shock', 'adapt', 'unfamiliar'],
  'Redemption': ['forgive', 'redeem', 'redemption', 'second chance', 'make amends', 'atone', 'reform', 'salvation', 'repent'],
  'Star-Crossed Lovers': ['forbidden love', 'can\'t be together', 'rival families', 'doomed romance', 'tragic love', 'star-crossed', 'love across'],
  'Underdog': ['unlikely', 'against all odds', 'no chance', 'prove', 'doubt', 'nobody believed', 'underdog', 'long shot', 'outmatched'],
  'Ensemble Cast': ['group', 'team', 'each character', 'multiple storylines', 'ensemble', 'interconnected', 'parallel lives'],
  'Mentor': ['teacher', 'mentor', 'trainer', 'master', 'wise', 'guide', 'train', 'apprentice', 'protege', 'student'],
  'Survival': ['survive', 'survival', 'stranded', 'wilderness', 'desert island', 'trapped', 'escape', 'fight for life', 'last one standing'],
  'Road Trip': ['road trip', 'drive', 'highway', 'journey', 'cross-country', 'van', 'travel', 'on the road', 'roadside'],
  'Non-Linear': ['flashback', 'flash forward', 'years earlier', 'years later', 'timeline', 'out of order', 'nonlinear', 'non-linear'],
  'Unreliable Narrator': ['unreliable', 'imagined', 'delusion', 'hallucin', 'not real', 'in my head', 'can\'t trust', 'lying to'],
  'Post-Apocalypse': ['post-apocalyp', 'wasteland', 'after the fall', 'survivors', 'ruins', 'civilization fell', 'last city', 'nuclear'],
  'Dystopia': ['dystopia', 'totalitarian', 'oppressive', 'regime', 'surveillance', 'control', 'rebellion', 'resistance', 'freedom'],
  'Found Footage': ['camera', 'recording', 'footage', 'documentary', 'handheld', 'found tape', 'video diary'],
  'One-Man Army': ['alone', 'single-handedly', 'one man', 'one woman', 'army of one', 'solo mission', 'outnumbered'],
  'Double Cross': ['betray', 'betrayal', 'double cross', 'backstab', 'traitor', 'sold out', 'turned on', 'trust no one'],
  'Political Intrigue': ['politics', 'senator', 'election', 'conspiracy', 'cover-up', 'government', 'corruption', 'power play', 'campaign'],
  'Trapped': ['trapped', 'locked', 'confined', 'no way out', 'escape room', 'sealed', 'prisoner', 'cage', 'bunker'],
  'Strong Female Lead': ['she fights', 'heroine', 'warrior woman', 'strong woman', 'female lead', 'she leads', 'she commands'],
  'Family': ['family', 'father', 'mother', 'son', 'daughter', 'brother', 'sister', 'reunion', 'estranged', 'orphan', 'adoption'],
  'Dark Comedy': ['dark humor', 'dark comedy', 'morbid', 'gallows humor', 'ironic', 'absurd', 'satirical', 'cynical'],
  'Social Commentary': ['society', 'inequality', 'class', 'privilege', 'systemic', 'social', 'commentary', 'critique', 'satire'],
  'Class Divide': ['rich', 'poor', 'wealthy', 'poverty', 'upper class', 'lower class', 'mansion', 'slum', 'inequality', 'privilege'],
  'Based on True Story': ['based on', 'true story', 'real events', 'inspired by', 'actual', 'true account', 'biographical'],
  'Period Piece': ['century', 'era', 'historical', 'period', 'ancient', 'medieval', 'victorian', 'colonial', 'wartime'],
  'Rise to Power': ['rise', 'power', 'empire', 'kingdom', 'throne', 'ambition', 'climb', 'conquer', 'dominion'],
  'Fallen Hero': ['fallen', 'disgraced', 'former glory', 'washed up', 'has-been', 'lost everything', 'fall from grace'],
  'Amnesia': ['amnesia', 'memory', 'forget', 'can\'t remember', 'lost memory', 'who am i', 'identity crisis'],
  'Monster': ['monster', 'beast', 'creature', 'predator', 'hunting them', 'lurking', 'stalking', 'horror'],
  'Haunted House': ['haunted', 'ghost', 'spirit', 'house', 'mansion', 'paranormal', 'poltergeist', 'possession'],
  'Body Horror': ['transform', 'mutation', 'body', 'flesh', 'parasite', 'infected', 'growth', 'metamorphosis'],
  'Paranoia': ['paranoia', 'paranoid', 'watching', 'followed', 'they\'re coming', 'trust no one', 'surveillance', 'spy'],
  'Ticking Clock': ['deadline', 'countdown', 'hours left', 'time is running', 'before it\'s too late', 'ticking', 'clock', 'hurry'],
  'Sacrifice': ['sacrifice', 'give up', 'die for', 'lay down', 'selfless', 'noble death', 'martyr', 'ultimate price'],
  'Identity': ['identity', 'who am i', 'imposter', 'disguise', 'double life', 'assumed name', 'fake identity', 'doppelganger'],
  'Obsession': ['obsess', 'obsession', 'fixat', 'compuls', 'can\'t stop', 'consumed by', 'driven mad', 'stalker'],
  'Hidden Genius': ['genius', 'prodigy', 'brilliant', 'savant', 'gifted', 'intellectual', 'mastermind', 'extraordinary mind'],
  'Simulation': ['simulation', 'virtual', 'matrix', 'simulated', 'program', 'artificial world', 'not real', 'glitch'],
  'AI Consciousness': ['artificial intelligence', 'ai', 'sentient', 'robot', 'consciousness', 'self-aware', 'machine learning', 'android'],
  'Multiverse': ['multiverse', 'parallel', 'alternate', 'dimension', 'other world', 'portal', 'reality', 'universe'],
  'Music Driven': ['music', 'band', 'sing', 'concert', 'songwriter', 'rock', 'jazz', 'hip hop', 'orchestra', 'musician'],
  'Military': ['military', 'soldier', 'war', 'army', 'combat', 'battlefield', 'platoon', 'mission', 'deploy', 'general'],
  'Courtroom': ['trial', 'court', 'judge', 'jury', 'lawyer', 'attorney', 'verdict', 'guilty', 'innocent', 'testimony', 'objection'],
};

// ─── Korean Trope Keyword Clusters ───

const KOREAN_TROPE_KEYWORDS: Record<string, string[]> = {
  // Historical / Political
  'Military Coup (군사 쿠데타)': ['쿠데타', '군사', '반란', '정변', '계엄령', '대통령', 'coup', 'martial law'],
  'Japanese Occupation Resistance (항일 독립운동)': ['독립', '항일', '일제', '광복', '독립군', '만세', '식민지', 'japanese occupation', 'resistance'],
  'Korean War Division (한국전쟁/분단)': ['한국전쟁', '6.25', '분단', '휴전선', '남북', '38선', '이산가족', '피난민', '인민군', 'korean war', 'division'],
  'Democratization Movement (민주화 운동)': ['민주화', '시위', '학생운동', '광주', '민주주의', '투쟁', '항쟁', 'democracy', 'protest'],
  'Political Thriller (정치 스릴러)': ['정치', '국회', '대선', '정당', '권력', '의원', '청와대', '선거', '정권', '암살', '음모', 'politics', 'election', 'conspiracy'],
  'Based on True Events (실화 기반)': ['실화', '실제', '사건', '기반', '모티브', '실존', 'true story', 'based on', 'real events'],
  'National Tragedy (국가적 비극)': ['참사', '재난', '사고', '희생', '추모', '구조', '침몰', 'tragedy', 'disaster'],
  'Period Piece (시대극)': ['조선', '고려', '왕조', '궁궐', '양반', '시대극', '역사적', '사극', '왕비', '임금', 'joseon', 'dynasty', 'historical'],

  // Social / Class
  'Class Divide (계층 갈등)': ['부자', '가난', '계층', '상류', '하류', '불평등', '차별', '재벌', '빈곤', 'class', 'rich', 'poor', 'inequality'],
  'Urban vs Rural (도시 vs 농촌)': ['시골', '농촌', '도시', '상경', '귀향', '고향', '마을', 'rural', 'urban', 'countryside'],
  'Corporate Corruption (재벌 비리)': ['재벌', '회장', '비리', '횡령', '배임', '뇌물', '로비', '비자금', '탈세', '기업 범죄', 'conglomerate', 'chaebol', 'corruption'],
  'Education Pressure (입시 지옥)': ['입시', '수능', '학원비', '과외', '성적표', '공부', '재수', '수시', '정시', 'exam', 'education pressure'],
  'Housing Crisis (주거 문제)': ['전세', '월세', '집값', '반지하', '옥탑방', '부동산', '집을 잃', '쫓겨', '노숙', 'housing', 'rent'],
  'Social Commentary (사회 비판)': ['사회', '비판', '풍자', '부조리', '시스템', '체제', '모순', 'society', 'critique', 'satire'],
  'Corruption Exposé (부패 폭로)': ['부패', '폭로', '내부고발', '비리', '은폐', '진실', '기자', '언론', '증거', '제보', '특종', 'corruption', 'exposé', 'whistleblower'],
  'Workplace Drama (직장 드라마)': ['직장', '상사', '부장님', '대리님', '퇴사', '야근', '회식', '사무실', '출근', 'office', 'workplace'],

  // Family / Relationship
  'Family Sacrifice (가족의 희생)': ['가족', '희생', '부모', '자식', '엄마', '아빠', '아들', '딸', '가정', 'family', 'sacrifice', 'parent'],
  'Generational Conflict (세대 갈등)': ['세대', '어른', '꼰대', '젊은', '갈등', '구세대', '신세대', 'generation', 'old', 'young'],
  'Father-Son Bond (부자 관계)': ['아버지', '아들', '부자', '부모', '유산', '가업', 'father', 'son', 'dad'],
  'Filial Duty (효도/의무)': ['효도', '부모님', '모시', '봉양', '의무', '장남', '제사', 'filial', 'duty', 'elder'],
  'Found Family (가족 같은 관계)': ['식구', '한솥밥', '가족 같', '가족이나 다름없', '형제 같', '동료애', 'found family', 'like family', 'bond'],
  'Star-Crossed Lovers (이루지 못한 사랑)': ['이별', '사랑', '운명', '금지', '신분', '허락', '비극', 'forbidden love', 'doomed', 'tragic love'],
  'Mentor-Student (사제 관계)': ['스승', '제자', '사범', '도장', '가르침', '수련', '사부님', '사제 관계', 'mentor', 'apprentice'],

  // Cultural / Spiritual
  'Shamanism (무속 신앙)': ['무당', '굿판', '접신', '신내림', '영매', '점쟁이', '부적', '주술', '무속', '퇴마', '빙의', 'shaman', 'ritual', 'spirit medium'],
  'Han / Collective Grief (한)': ['한이', '한을', '한풀이', '서러움', '억울', '통곡', '설움', '원통', '눈물', '비통', '원한', 'han', 'grief', 'sorrow', 'resentment'],
  'Jeong / Deep Bond (정)': ['정이', '정을', '정들', '미움', '나누', '정나미', 'jeong', 'bond', 'attachment'],
  'Confucian Hierarchy (유교적 위계)': ['유교', '예절', '위계', '서열', '어른', '존경', '전통', '예의', 'confucian', 'hierarchy', 'respect'],
  'Folk Horror (토속 공포)': ['전설', '귀신', '저주', '마을', '무덤', '제사', '토속', '공포', '괴담', '시체', '유령', '흉측', '흉물', '비명', '어둠', '그림자', 'folk', 'curse', 'village', 'legend', 'horror', 'ghost'],
  'Buddhist Philosophy (불교 철학)': ['스님', '절에', '명상', '깨달음', '윤회', '해탈', '불교', '부처', 'buddhist', 'temple', 'enlightenment'],
  'Historical Curse (역사적 저주)': ['저주', '봉인', '유물', '발굴', '고대', '무덤', '역사', '해골', '유해', 'curse', 'ancient', 'artifact'],

  // Genre Conventions
  'Revenge Drama (복수극)': ['복수', '원수', '응징', '보복', '앙갚음', '복수심', '원한', '되갚', '갚아', 'revenge', 'avenge', 'vengeance'],
  'Gangster Saga (조폭 영화)': ['조폭', '보스', '두목', '조직폭력', '깡패', '파벌', '형님', '건달', '주먹', '조직원', 'gangster', 'mob', 'boss'],
  'Survival Game (생존 게임)': ['생존', '게임', '탈락', '경쟁', '살아남', '규칙', '참가자', 'survival', 'game', 'eliminate'],
  'Heist (도둑/강탈)': ['도둑', '강도', '금고', '훔치', '침입', '작전', '한탕', '강탈', '빼돌리', '빼앗', '탈취', 'heist', 'steal', 'robbery', 'vault'],
  'Military Action (군사 액션)': ['군대', '전투', '작전', '특수부대', '병사', '전장', '임무', 'military', 'soldier', 'combat', 'mission'],
  'Twist Ending (반전)': ['반전', '사실은', '알고 보니', '비밀', '진실', '뒤집', '충격', 'twist', 'reveal', 'truth'],
  'Dark Comedy (블랙 코미디)': ['블랙', '코미디', '풍자', '아이러니', '우스꽝', '엉뚱', '웃기', 'dark comedy', 'satire', 'ironic', 'absurd'],
  'Ensemble Investigation (합동 수사)': ['수사', '형사', '경찰', '단서', '용의자', '사건', '증거', '수사관', 'investigation', 'detective', 'suspect'],
  'Underdog Hero (약자의 승리)': ['약자', '패배', '이기', '승리', '극복', '역전', '도전', 'underdog', 'overcome', 'against odds'],
  'Sacrifice & Redemption (희생과 구원)': ['희생', '구원', '구하', '목숨', '대신', '살리', '구출', 'sacrifice', 'save', 'redemption'],
  'Coming of Age (성장)': ['성장', '학생', '청소년', '졸업', '첫', '어른', '사춘기', '방황', 'coming of age', 'growing up', 'teenager'],
  'Chase/Pursuit (추격)': ['추격전', '도망치', '추적하', '도주하', '쫓아가', '뒤쫓', 'chase', 'pursuit', 'escape'],
  'Isolation/Confinement (고립/감금)': ['고립', '감금', '갇히', '밀실', '지하', '탈출', '가두', 'isolation', 'confined', 'trapped', 'locked'],
  'Double Identity (이중 정체성)': ['정체', '이중', '가면', '위장', '변장', '스파이', '잠입', 'double identity', 'disguise', 'undercover'],
  'Ensemble Cast (앙상블 캐스트)': ['교차 편집', '동시다발', '각자의 이야기', '옴니버스', '병렬 구조', 'ensemble', 'interconnected', 'multiple storylines'],
  'Anti-Hero (안티히어로)': ['안티', '히어로', '반영웅', '악당', '주인공', '범죄자', '불법', 'anti-hero', 'antihero', 'vigilante'],
  'Undercover (잠입 수사)': ['잠입', '위장', '스파이', '첩보', '밀정', '비밀 요원', '정보원', 'undercover', 'spy', 'infiltrate'],
  'Courtroom (법정극)': ['법정', '재판', '판사', '변호사', '검사', '배심원', '판결', '무죄', '유죄', 'trial', 'court', 'judge', 'verdict'],
  'Noraebang/Drinking Scene (노래방/술자리)': ['노래방', '술집', '회식', '소주', '맥주', '건배', '취해', 'karaoke', 'drinking', 'bar'],
  'Rooftop/Banjiha Setting (옥탑방/반지하)': ['옥탑방', '반지하', '고시원', '원룸', '좁은', '다세대', 'rooftop room', 'basement', 'cramped'],
};

// ─── Scoring Algorithm ───

/** Returns true if the string contains any Korean syllable (U+AC00-U+D7AF) */
function isKoreanKeyword(kw: string): boolean {
  return /[\uAC00-\uD7AF]/.test(kw);
}

function scoreTropes(
  text: string,
  dictionary: string[],
  keywordMap: Record<string, string[]>,
): string[] {
  const lower = text.toLowerCase();
  const scores: { trope: string; score: number }[] = [];

  for (const trope of dictionary) {
    const keywords = keywordMap[trope];
    if (!keywords || keywords.length === 0) continue;

    let score = 0;
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      // Korean keywords: \b doesn't work for CJK — always use indexOf
      if (isKoreanKeyword(kw)) {
        let idx = 0;
        while ((idx = lower.indexOf(kwLower, idx)) !== -1) {
          score++;
          idx += kwLower.length;
        }
      } else if (kw.length <= 2) {
        // Very short English keywords: require word boundary to reduce false positives
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        const matches = lower.match(regex);
        if (matches) score += matches.length;
      } else {
        let idx = 0;
        while ((idx = lower.indexOf(kwLower, idx)) !== -1) {
          score++;
          idx += kwLower.length;
        }
      }
    }

    if (score >= 2) {
      scores.push({ trope, score });
    }
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.trope);
}

// ─── Synopsis Builder (full script, no LLM token limit) ───

function buildFullSynopsis(elements: ScriptElement[]): string {
  const lines: string[] = [];

  for (const el of elements) {
    if (el.type === 'scene_heading') {
      lines.push(`\n[${el.text}]`);
    } else if (el.type === 'action') {
      lines.push(el.text);
    } else if (el.type === 'dialogue') {
      lines.push(el.text);
    }
  }

  return lines.join('\n');
}

// ─── Public API (no LLM dependency) ───

export class TropeAnalyzer {
  analyze(scriptId: string, elements: ScriptElement[], market: MarketLocale = 'hollywood'): TropeResult {
    const synopsis = buildFullSynopsis(elements);
    const dictionary = market === 'korean' ? KOREAN_TROPE_DICTIONARY : TROPE_DICTIONARY;
    const keywordMap = market === 'korean' ? KOREAN_TROPE_KEYWORDS : TROPE_KEYWORDS;

    const tropes = scoreTropes(synopsis, dictionary, keywordMap);

    return { scriptId, tropes };
  }
}
