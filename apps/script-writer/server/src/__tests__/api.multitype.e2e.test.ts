/**
 * Multi-Project-Type E2E Test Suite
 *
 * Covers all 5 project categories supported by the app:
 *   - Feature Film  (영화)
 *   - Short Film    (단편영화)
 *   - Netflix Original (드라마/시리즈)
 *   - Commercial    (광고)
 *   - YouTube       (유튜브 크리에이터)
 *
 * Each section: CREATE → READ → UPDATE → OUTLINE → DELETE
 * Final section: loglines across types + DB integrity checks
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";

const BASE = "http://localhost:3006/api";

// ────────────────────────────────────────────────────────────────────────────
// Shared project IDs — populated during creation, cleaned up in afterAll
// ────────────────────────────────────────────────────────────────────────────
const ids: Record<string, number> = {
  featureFilm: 0,
  shortFilm: 0,
  netflixOriginal: 0,
  commercial: 0,
  youtube: 0,
};

const loglineIds: number[] = [];

// ────────────────────────────────────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────────────────────────────────────
async function createProject(
  title: string,
  category: string,
  genre: string
): Promise<number> {
  const res = await fetch(`${BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, genre }),
  });
  const body = (await res.json()) as any;
  return body.project.id as number;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. FEATURE FILM  (영화)
// ════════════════════════════════════════════════════════════════════════════

describe("[Feature Film] POST /api/projects — create", () => {
  it("creates a Feature Film project", async () => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "TEST_E2E_FEATURE_FILM",
        category: "Feature Film",
        genre: "Drama",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.category).toBe("Feature Film");
    expect(body.project.genre).toBe("Drama");
    ids.featureFilm = body.project.id;
  });
});

describe("[Feature Film] GET /api/projects/:id — read", () => {
  it("retrieves the Feature Film project by ID", async () => {
    const res = await fetch(`${BASE}/projects/${ids.featureFilm}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.title).toBe("TEST_E2E_FEATURE_FILM");
    expect(body.category).toBe("Feature Film");
  });

  it("appears in the global projects list", async () => {
    const res = await fetch(`${BASE}/projects`);
    const body = (await res.json()) as any;
    const found = body.projects.find((p: any) => p.id === ids.featureFilm);
    expect(found).toBeDefined();
    expect(found.category).toBe("Feature Film");
  });
});

describe("[Feature Film] PATCH /api/projects/:id — update", () => {
  it("updates logline, treatment stage, and progress", async () => {
    const res = await fetch(`${BASE}/projects/${ids.featureFilm}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline: "한 형사가 자신의 과거와 마주하며 진실을 추적한다.",
        concept: "3막 구조의 누아르 스릴러. 복잡한 인물 관계.",
        progress: 30,
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.logline).toContain("형사");
    expect(body.project.progress).toBe(30);
  });
});

describe("[Feature Film] Outline — 3-act structure", () => {
  const scenes = [
    { act: 1, sceneNumber: 1, title: "SETUP",       description: "주인공 소개, 일상 붕괴의 시작",                 status: "Planned" },
    { act: 1, sceneNumber: 2, title: "INCITING",    description: "사건 발생, 형사가 배정됨",                     status: "Planned" },
    { act: 2, sceneNumber: 3, title: "CONFRONTATION",description: "용의자 추적, 반전 단서 발견",                   status: "Planned" },
    { act: 2, sceneNumber: 4, title: "DARK MOMENT", description: "주인공 위기, 협력자 배신",                     status: "Planned" },
    { act: 3, sceneNumber: 5, title: "CLIMAX",      description: "최종 대결, 진실 폭로",                         status: "Planned" },
    { act: 3, sceneNumber: 6, title: "RESOLUTION",  description: "정의 실현, 여운 있는 엔딩",                    status: "Planned" },
  ];

  it("saves a 6-scene 3-act outline", async () => {
    const res = await fetch(`${BASE}/projects/${ids.featureFilm}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
  });

  it("retrieves all 6 scenes in order", async () => {
    const res = await fetch(`${BASE}/projects/${ids.featureFilm}/outline`);
    const body = (await res.json()) as any;
    expect(body.outline).toHaveLength(6);
    expect(body.outline[0].act).toBe(1);
    expect(body.outline[4].title).toBe("CLIMAX");
    expect(body.outline[5].act).toBe(3);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. SHORT FILM  (단편영화)
// ════════════════════════════════════════════════════════════════════════════

describe("[Short Film] POST /api/projects — create", () => {
  it("creates a Short Film project", async () => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "TEST_E2E_SHORT_FILM",
        category: "Short Film",
        genre: "Sci-Fi",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.category).toBe("Short Film");
    ids.shortFilm = body.project.id;
  });
});

describe("[Short Film] CRUD cycle", () => {
  it("reads back the Short Film project", async () => {
    const res = await fetch(`${BASE}/projects/${ids.shortFilm}`);
    const body = (await res.json()) as any;
    expect(body.category).toBe("Short Film");
    expect(body.genre).toBe("Sci-Fi");
  });

  it("updates treatment and sets progress to 50", async () => {
    const res = await fetch(`${BASE}/projects/${ids.shortFilm}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline: "2089년, AI와 공존하는 세계에서 홀로 잠든 인간이 깨어난다.",
        progress: 50,
        status: "Active",
      }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.progress).toBe(50);
  });

  it("saves a compact 3-scene outline for 10-min film", async () => {
    const scenes = [
      { act: 1, sceneNumber: 1, title: "AWAKENING",  description: "냉동 캡슐에서 깨어남, 미래 세계 노출",     status: "Planned" },
      { act: 2, sceneNumber: 2, title: "DISCOVERY",  description: "AI가 인류를 지배하고 있음을 인지",         status: "Planned" },
      { act: 3, sceneNumber: 3, title: "CHOICE",     description: "저항 vs 동화 — 마지막 선택",               status: "Planned" },
    ];
    const res = await fetch(`${BASE}/projects/${ids.shortFilm}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
  });

  it("retrieves 3-scene outline", async () => {
    const res = await fetch(`${BASE}/projects/${ids.shortFilm}/outline`);
    const body = (await res.json()) as any;
    expect(body.outline).toHaveLength(3);
    expect(body.outline[2].title).toBe("CHOICE");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. NETFLIX ORIGINAL  (드라마 / 시리즈)
// ════════════════════════════════════════════════════════════════════════════

describe("[Netflix Original] POST /api/projects — create", () => {
  it("creates a Netflix Original drama project", async () => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "TEST_E2E_NETFLIX_DRAMA",
        category: "Netflix Original",
        genre: "Thriller",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.category).toBe("Netflix Original");
    ids.netflixOriginal = body.project.id;
  });
});

describe("[Netflix Original] CRUD cycle", () => {
  it("reads back the Netflix Original project", async () => {
    const res = await fetch(`${BASE}/projects/${ids.netflixOriginal}`);
    const body = (await res.json()) as any;
    expect(body.category).toBe("Netflix Original");
    expect(body.genre).toBe("Thriller");
  });

  it("updates concept with binge-hook strategy", async () => {
    const res = await fetch(`${BASE}/projects/${ids.netflixOriginal}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline: "한 가족의 비밀이 8개 에피소드에 걸쳐 점층적으로 드러난다.",
        concept: "Binge-hook 전략. 각 에피소드 끝에 반전 클리프행어.",
        progress: 15,
      }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.concept).toContain("클리프행어");
  });

  it("saves an 8-episode structure as outline scenes", async () => {
    const episodes = Array.from({ length: 8 }, (_, i) => ({
      act: Math.ceil((i + 1) / 3),
      sceneNumber: i + 1,
      title: `EP${i + 1}`,
      description: `에피소드 ${i + 1}: 중심 갈등 심화 및 서브플롯 확장`,
      status: "Planned",
    }));
    const res = await fetch(`${BASE}/projects/${ids.netflixOriginal}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: episodes }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
  });

  it("retrieves all 8 episode stubs", async () => {
    const res = await fetch(`${BASE}/projects/${ids.netflixOriginal}/outline`);
    const body = (await res.json()) as any;
    expect(body.outline).toHaveLength(8);
    expect(body.outline[7].title).toBe("EP8");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. COMMERCIAL / AD  (광고)
// ════════════════════════════════════════════════════════════════════════════

describe("[Commercial] POST /api/projects — create", () => {
  it("creates a Commercial Ad project", async () => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "TEST_E2E_COMMERCIAL_MULTITYPE",
        category: "Commercial",
        genre: "Lifestyle",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.category).toBe("Commercial");
    ids.commercial = body.project.id;
  });
});

describe("[Commercial] CRUD cycle", () => {
  it("reads back the Commercial project", async () => {
    const res = await fetch(`${BASE}/projects/${ids.commercial}`);
    const body = (await res.json()) as any;
    expect(body.category).toBe("Commercial");
    expect(body.genre).toBe("Lifestyle");
  });

  it("updates with A/V two-column concept", async () => {
    const res = await fetch(`${BASE}/projects/${ids.commercial}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline: "30초: 제품의 일상 속 자연스러운 통합을 보여준다.",
        concept: "USP 중심 A/V 2컬럼 포맷. 감성적 스토리텔링.",
        progress: 60,
      }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.progress).toBe(60);
  });

  it("stores storyboardImages JSON as an object", async () => {
    const images = {
      "1": "http://localhost:3006/storyboard/frame1.jpg",
      "2": "http://localhost:3006/storyboard/frame2.jpg",
      "3": "http://localhost:3006/storyboard/frame3.jpg",
    };
    const res = await fetch(`${BASE}/projects/${ids.commercial}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyboardImages: images }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project).toHaveProperty("storyboardImages");
  });

  it("saves a 5-beat commercial outline", async () => {
    const scenes = [
      { act: 1, sceneNumber: 1, title: "HOOK",       description: "오프닝 임팩트 — 0~3s",          status: "Planned" },
      { act: 1, sceneNumber: 2, title: "PROBLEM",    description: "일상의 불편 제시 — 3~10s",       status: "Planned" },
      { act: 2, sceneNumber: 3, title: "SOLUTION",   description: "제품 등장 및 데모 — 10~22s",     status: "Planned" },
      { act: 2, sceneNumber: 4, title: "BENEFIT",    description: "감성 전환, 사용 후 변화 — 22~27s", status: "Planned" },
      { act: 3, sceneNumber: 5, title: "CTA",        description: "로고 + 캐치프레이즈 — 27~30s",   status: "Planned" },
    ];
    const res = await fetch(`${BASE}/projects/${ids.commercial}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
  });

  it("retrieves 5-beat outline", async () => {
    const res = await fetch(`${BASE}/projects/${ids.commercial}/outline`);
    const body = (await res.json()) as any;
    expect(body.outline).toHaveLength(5);
    expect(body.outline[4].title).toBe("CTA");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. YOUTUBE / CREATOR  (유튜브)
// ════════════════════════════════════════════════════════════════════════════

describe("[YouTube] POST /api/projects — create", () => {
  it("creates a YouTube Creator project", async () => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "TEST_E2E_YOUTUBE",
        category: "YouTube",
        genre: "Tutorial",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.category).toBe("YouTube");
    ids.youtube = body.project.id;
  });
});

describe("[YouTube] CRUD cycle", () => {
  it("reads back the YouTube project", async () => {
    const res = await fetch(`${BASE}/projects/${ids.youtube}`);
    const body = (await res.json()) as any;
    expect(body.category).toBe("YouTube");
    expect(body.genre).toBe("Tutorial");
  });

  it("updates with hook-driven content concept", async () => {
    const res = await fetch(`${BASE}/projects/${ids.youtube}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline: "10분 이내에 React 상태 관리를 완벽하게 설명하는 튜토리얼.",
        concept: "Hook 3초 내 시청자 주목. 챕터 구분. CTA 자연스럽게 삽입.",
        progress: 40,
      }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.project.logline).toContain("튜토리얼");
  });

  it("saves a YouTube content structure outline", async () => {
    const scenes = [
      { act: 1, sceneNumber: 1, title: "HOOK",        description: "3초 이내 충격적 오프닝 질문",           status: "Planned" },
      { act: 1, sceneNumber: 2, title: "INTRO",        description: "채널 소개 + 오늘 다룰 내용 preview",    status: "Planned" },
      { act: 2, sceneNumber: 3, title: "CHAPTER 1",   description: "핵심 개념 설명 — useState 기초",        status: "Planned" },
      { act: 2, sceneNumber: 4, title: "CHAPTER 2",   description: "실전 예제 코딩 — 투두 앱 구현",         status: "Planned" },
      { act: 2, sceneNumber: 5, title: "CHAPTER 3",   description: "심화: useReducer vs useState 비교",     status: "Planned" },
      { act: 3, sceneNumber: 6, title: "SUMMARY",     description: "핵심 내용 요약 + 다음 영상 예고",        status: "Planned" },
      { act: 3, sceneNumber: 7, title: "CTA",         description: "구독 + 좋아요 + 댓글 유도",             status: "Planned" },
    ];
    const res = await fetch(`${BASE}/projects/${ids.youtube}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
  });

  it("retrieves 7-part YouTube content outline", async () => {
    const res = await fetch(`${BASE}/projects/${ids.youtube}/outline`);
    const body = (await res.json()) as any;
    expect(body.outline).toHaveLength(7);
    expect(body.outline[0].title).toBe("HOOK");
    expect(body.outline[6].title).toBe("CTA");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. LOGLINES — Cross-Category
// ════════════════════════════════════════════════════════════════════════════

describe("Loglines — cross-category CRUD", () => {
  const loglinePayloads = [
    { content: "[영화] 두 형제가 전쟁터에서 재회하며 선택에 직면한다.",       genre: "Drama",    category: "Feature Film" },
    { content: "[단편] 마지막 나무 한 그루가 문명을 구하는 씨앗을 품는다.",   genre: "Sci-Fi",   category: "Short Film" },
    { content: "[드라마] 재벌가 며느리가 숨겨진 진실을 조각 맞춰간다.",       genre: "Thriller", category: "Netflix Original" },
    { content: "[광고] 단 한 모금으로 일상이 달라지는 경험.",                 genre: "Lifestyle",category: "Commercial" },
    { content: "[유튜브] 당신이 몰랐던 Next.js 최적화 5가지.",               genre: "Tutorial", category: "YouTube" },
  ];

  it("creates one logline per project category", async () => {
    for (const payload of loglinePayloads) {
      const res = await fetch(`${BASE}/loglines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.logline.category).toBe(payload.category);
      loglineIds.push(body.logline.id);
    }
    expect(loglineIds).toHaveLength(5);
  });

  it("lists all loglines and finds our 5", async () => {
    const res = await fetch(`${BASE}/loglines`);
    const body = (await res.json()) as any;
    expect(Array.isArray(body.loglines)).toBe(true);
    const ourIds = new Set(loglineIds);
    const found = body.loglines.filter((l: any) => ourIds.has(l.id));
    expect(found).toHaveLength(5);
  });

  it("deletes all 5 test loglines", async () => {
    for (const id of loglineIds) {
      const res = await fetch(`${BASE}/loglines/${id}`, { method: "DELETE" });
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. DATABASE INTEGRITY — All 5 projects visible in list
// ════════════════════════════════════════════════════════════════════════════

describe("DB Integrity — all project types visible in list", () => {
  it("projects list contains all 5 test projects", async () => {
    const res = await fetch(`${BASE}/projects`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    const testIds = new Set(Object.values(ids));
    const found = body.projects.filter((p: any) => testIds.has(p.id));
    expect(found).toHaveLength(5);
  });

  it("each project has the correct category stored", async () => {
    const expected: Record<number, string> = {
      [ids.featureFilm]:    "Feature Film",
      [ids.shortFilm]:      "Short Film",
      [ids.netflixOriginal]:"Netflix Original",
      [ids.commercial]:     "Commercial",
      [ids.youtube]:        "YouTube",
    };
    for (const [idStr, expectedCategory] of Object.entries(expected)) {
      const res = await fetch(`${BASE}/projects/${idStr}`);
      const body = (await res.json()) as any;
      expect(body.category).toBe(expectedCategory);
    }
  });

  it("each project's outline was persisted correctly", async () => {
    const expectedOutlineLengths: Record<number, number> = {
      [ids.featureFilm]:     6,
      [ids.shortFilm]:       3,
      [ids.netflixOriginal]: 8,
      [ids.commercial]:      5,
      [ids.youtube]:         7,
    };
    for (const [idStr, expectedLen] of Object.entries(expectedOutlineLengths)) {
      const res = await fetch(`${BASE}/projects/${idStr}/outline`);
      const body = (await res.json()) as any;
      expect(body.outline).toHaveLength(expectedLen);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. DELETE — Cleanup all 5 test projects
// ════════════════════════════════════════════════════════════════════════════

describe("DELETE /api/projects/:id — cleanup all test projects", () => {
  it("deletes all 5 test projects", async () => {
    for (const [key, id] of Object.entries(ids)) {
      if (!id) continue;
      const res = await fetch(`${BASE}/projects/${id}`, { method: "DELETE" });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
    }
  });

  it("confirms each project is gone after deletion", async () => {
    for (const id of Object.values(ids)) {
      if (!id) continue;
      const res = await fetch(`${BASE}/projects/${id}`);
      const body = await res.json();
      expect(body).toBeNull();
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Safety net: afterAll cleanup in case individual tests fail midway
// ────────────────────────────────────────────────────────────────────────────

afterAll(async () => {
  const allIds = [...Object.values(ids), ...loglineIds].filter(Boolean);
  await Promise.allSettled([
    ...Object.values(ids).filter(Boolean).map((id) =>
      fetch(`${BASE}/projects/${id}`, { method: "DELETE" })
    ),
    ...loglineIds.map((id) =>
      fetch(`${BASE}/loglines/${id}`, { method: "DELETE" })
    ),
  ]);
});
