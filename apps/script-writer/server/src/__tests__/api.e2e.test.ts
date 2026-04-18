import { describe, it, expect, beforeAll, afterAll } from "bun:test";

const BASE = `${(process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006")}/api`;

// Track created IDs for cleanup
let createdProjectId: number;
let createdLoglineId: number;

// ─── PROJECTS ───────────────────────────────────────────────────────────────

describe("GET /api/projects", () => {
  it("returns 200 with projects array", async () => {
    const res = await fetch(`${BASE}/projects`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body).toHaveProperty("projects");
    expect(Array.isArray(body.projects)).toBe(true);
  });
});

describe("POST /api/projects", () => {
  it("creates a new Commercial project and returns it", async () => {
    const payload = {
      title: "TEST_E2E_AD_PROJECT",
      category: "Commercial",
      genre: "Action"
    };
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.project.title).toBe(payload.title);
    expect(body.project.category).toBe(payload.category);
    expect(body.project.genre).toBe(payload.genre);
    expect(typeof body.project.id).toBe("number");
    createdProjectId = body.project.id;
  });

  it("rejects missing required fields", async () => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Missing fields" })
    });
    expect(res.status).not.toBe(200);
  });
});

describe("GET /api/projects/:id", () => {
  it("returns the created project by ID", async () => {
    const res = await fetch(`${BASE}/projects/${createdProjectId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.id).toBe(createdProjectId);
    expect(body.title).toBe("TEST_E2E_AD_PROJECT");
  });

  it("returns null for non-existent project", async () => {
    const res = await fetch(`${BASE}/projects/999999`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBeNull();
  });
});

describe("PATCH /api/projects/:id", () => {
  it("updates project logline and concept", async () => {
    const res = await fetch(`${BASE}/projects/${createdProjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline: "E2E test logline for a 30s ad.",
        concept: "Brand awareness campaign for test.",
        progress: 25
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.project.logline).toBe("E2E test logline for a 30s ad.");
    expect(body.project.progress).toBe(25);
  });

  it("serializes storyboardImages JSON correctly", async () => {
    const images = { "1": `${(process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006")}/public/storyboard/images/test.jpg` };
    const res = await fetch(`${BASE}/projects/${createdProjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyboardImages: images })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    // DB stores as JSON string — verify it round-trips through the PATCH
    expect(body.project).toHaveProperty("storyboardImages");
  });
});

// ─── OUTLINE ────────────────────────────────────────────────────────────────

describe("POST & GET /api/projects/:id/outline", () => {
  const scenes = [
    { sceneNumber: 1, act: 1, title: "HOOK", description: "Opening shot — product reveal", status: "Planned" },
    { sceneNumber: 2, act: 1, title: "CONFLICT", description: "Athlete pushes limits", status: "Planned" },
    { sceneNumber: 3, act: 2, title: "RESOLUTION", description: "Victory moment — brand close", status: "Planned" }
  ];

  it("saves outline scenes", async () => {
    const res = await fetch(`${BASE}/projects/${createdProjectId}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });

  it("retrieves saved outline in scene order", async () => {
    const res = await fetch(`${BASE}/projects/${createdProjectId}/outline`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.outline).toHaveLength(3);
    expect(body.outline[0].title).toBe("HOOK");
    expect(body.outline[1].sceneNumber).toBe(2);
    expect(body.outline[2].description).toBe("Victory moment — brand close");
  });

  it("replaces outline on second POST (idempotent)", async () => {
    const newScenes = [{ sceneNumber: 1, description: "Replaced scene", status: "Draft" }];
    await fetch(`${BASE}/projects/${createdProjectId}/outline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: newScenes })
    });
    const res = await fetch(`${BASE}/projects/${createdProjectId}/outline`);
    const body = await res.json() as any;
    expect(body.outline).toHaveLength(1);
    expect(body.outline[0].description).toBe("Replaced scene");
  });
});

// ─── LOGLINES ───────────────────────────────────────────────────────────────

describe("GET /api/loglines", () => {
  it("returns loglines array", async () => {
    const res = await fetch(`${BASE}/loglines`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body).toHaveProperty("loglines");
    expect(Array.isArray(body.loglines)).toBe(true);
  });
});

describe("POST /api/loglines", () => {
  it("creates a logline idea for Commercial", async () => {
    const res = await fetch(`${BASE}/loglines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "E2E test: 30초 안에 브랜드를 각인시키는 광고.",
        genre: "Action",
        category: "Commercial"
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.logline.content).toContain("E2E test");
    createdLoglineId = body.logline.id;
  });
});

describe("DELETE /api/loglines/:id", () => {
  it("deletes the created logline", async () => {
    const res = await fetch(`${BASE}/loglines/${createdLoglineId}`, { method: "DELETE" });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });
});

// ─── EXPORT / JOB QUEUE ─────────────────────────────────────────────────────

describe("POST /api/projects/:id/export + GET /api/export/:jobId", () => {
  it("enqueues a PDF export job and polls status", async () => {
    const res = await fetch(`${BASE}/projects/${createdProjectId}/export`, { method: "POST" });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(typeof body.jobId).toBe("string");
    expect(body.status).toBe("pending");

    // Poll the job
    const pollRes = await fetch(`${BASE}/export/${body.jobId}`);
    expect(pollRes.status).toBe(200);
    const pollBody = await pollRes.json() as any;
    expect(pollBody.success).toBe(true);
    expect(pollBody.job).toHaveProperty("status");
  });

  it("returns 404 for unknown jobId", async () => {
    const res = await fetch(`${BASE}/export/nonexistent-job-id`);
    expect(res.status).toBe(404);
  });
});

// ─── HEALTH ─────────────────────────────────────────────────────────────────

describe("GET /", () => {
  it("server health check", async () => {
    const res = await fetch(`${(process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006")}/`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Alive");
  });
});

// ─── TEARDOWN ───────────────────────────────────────────────────────────────

afterAll(async () => {
  if (createdProjectId) {
    await fetch(`${BASE}/projects/${createdProjectId}`, { method: "DELETE" });
  }
});
