# 씬별 교차 에셋 생성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Step 6(연출기획) 화면에서 씬별로 이미지→비디오→오디오를 교차 생성할 수 있는 에셋 생성 서브탭 추가

**Architecture:** 기존 에셋 조회 API에 필터링 추가, screenplay 라우트에 씬 단위 비디오/오디오 생성 엔드포인트 추가, 프론트엔드에 에셋 생성 서브탭 추가. 에이전트 코드 변경 없이 단일 씬 DirectionPlan 래퍼로 기존 에이전트 재사용.

**Tech Stack:** Hono, Prisma, Next.js (React), Bun, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-21-interleaved-scene-asset-generation-design.md`

---

### Task 1: 에셋 조회 API에 sceneNumber/type 필터링 추가

**Files:**
- Modify: `apps/api/src/routes/assets.ts:9-33`

- [ ] **Step 1: assets.ts의 GET /:projectId 엔드포인트에 쿼리 파라미터 필터링 추가**

```typescript
// apps/api/src/routes/assets.ts — GET /:projectId 핸들러 내부
// 기존 where: { projectId } 를 아래로 변경:

const sceneNumber = c.req.query("sceneNumber")
const type = c.req.query("type")

const where: Record<string, unknown> = { projectId }
if (sceneNumber) where.sceneNumber = Number(sceneNumber)
if (type) where.type = type

const assets = await prisma.asset.findMany({
  where,
  orderBy: { createdAt: "desc" },
})
```

- [ ] **Step 2: 검증**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: curl로 필터링 동작 확인**

```bash
# 전체 에셋 (기존 동작 유지)
curl -b "token=$TOKEN" http://localhost:3001/api/assets/cmmxvposn0000aztqym4gy8so

# 씬 번호 필터
curl -b "token=$TOKEN" "http://localhost:3001/api/assets/cmmxvposn0000aztqym4gy8so?sceneNumber=1&type=IMAGE"
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/assets.ts
git commit -m "feat: 에셋 조회 API에 sceneNumber/type 필터링 추가"
```

---

### Task 2: 씬 단위 비디오 생성 API 추가

**Files:**
- Modify: `apps/api/src/routes/screenplay.ts` (끝부분, line 1198 이후)

- [ ] **Step 1: generate-video 엔드포인트 추가**

`apps/api/src/routes/screenplay.ts` 파일 끝(line 1198 이후, `export` 전)에 추가:

```typescript
// ─── 씬 단위 비디오 생성 ───

screenplayRoutes.post("/:projectId/scene/:sceneNumber/generate-video", async (c) => {
  const projectId = c.req.param("projectId")
  const sceneNumber = Number(c.req.param("sceneNumber"))

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new NotFoundError("Project", projectId)

  const dp = project.directionPlanJson as DirectionPlan | null
  if (!dp?.scenes?.length) {
    throw new ValidationError("Direction plan not found or empty")
  }

  const targetScene = dp.scenes.find((s: DPSceneShape) => s.scene_number === sceneNumber)
  if (!targetScene) {
    throw new ValidationError(`Scene ${sceneNumber} not found in direction plan`)
  }

  if (!targetScene.cuts?.length) {
    throw new ValidationError(`Scene ${sceneNumber} has no cuts`)
  }

  // 단일 씬 DirectionPlan 래퍼
  const scopedPlan = { ...dp, scenes: [targetScene] }

  const gw = new AIGateway()
  gw.register("gemini", new GeminiProvider(), true)

  const outputDir = join("output", "videos", projectId)
  await mkdir(outputDir, { recursive: true })

  const assets: Array<Record<string, unknown>> = []

  for (const cut of targetScene.cuts) {
    if (!cut.video_prompt) continue

    try {
      const result = await gw.video(cut.video_prompt, {
        provider: "gemini",
        aspectRatio: "16:9",
      })

      const fileName = `scene_${sceneNumber}_cut_${cut.cut_number}.mp4`
      const filePath = join(outputDir, fileName)
      await writeFile(filePath, result.videoBuffer)

      const asset = await prisma.asset.create({
        data: {
          projectId,
          type: "VIDEO",
          phase: "MAIN",
          agentName: "Generalist",
          sceneNumber,
          filePath,
          fileName,
          mimeType: "video/mp4",
          fileSize: result.videoBuffer.length,
          metadata: {
            cutNumber: cut.cut_number,
            duration: result.duration,
            prompt: cut.video_prompt,
          },
        },
      })

      assets.push({
        id: asset.id,
        fileName: asset.fileName,
        filePath: asset.filePath,
        sceneNumber,
        cutNumber: cut.cut_number,
        type: "VIDEO",
      })
    } catch (err) {
      console.error(`[generate-video] Scene ${sceneNumber} Cut ${cut.cut_number} failed:`, err)
      // 부분 실패 허용 — 성공한 에셋은 유지
    }
  }

  return c.json({ assets, sceneNumber, totalCuts: targetScene.cuts.length })
})
```

- [ ] **Step 2: 타입체크**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/routes/screenplay.ts
git commit -m "feat: 씬 단위 비디오 생성 API 추가"
```

---

### Task 3: 씬 단위 오디오 생성 API 추가

**Files:**
- Modify: `apps/api/src/routes/screenplay.ts` (Task 2 이후에 추가)

- [ ] **Step 1: generate-audio 엔드포인트 추가**

Task 2에서 추가한 코드 뒤에 이어서:

```typescript
// ─── 씬 단위 오디오 생성 ───

screenplayRoutes.post("/:projectId/scene/:sceneNumber/generate-audio", async (c) => {
  const projectId = c.req.param("projectId")
  const sceneNumber = Number(c.req.param("sceneNumber"))

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new NotFoundError("Project", projectId)

  const dp = project.directionPlanJson as DirectionPlan | null
  if (!dp?.scenes?.length) {
    throw new ValidationError("Direction plan not found or empty")
  }

  const targetScene = dp.scenes.find((s: DPSceneShape) => s.scene_number === sceneNumber)
  if (!targetScene) {
    throw new ValidationError(`Scene ${sceneNumber} not found in direction plan`)
  }

  const gw = new AIGateway()
  gw.register("gemini", new GeminiProvider(), true)

  const outputDir = join("output", "audio", projectId)
  await mkdir(outputDir, { recursive: true })

  const assets: Array<Record<string, unknown>> = []

  // 각 컷의 video_prompt에서 [Audio] 태그 추출하여 SFX 내레이션 생성
  // + 대화 있으면 dialogue TTS 생성
  for (const cut of (targetScene.cuts ?? [])) {
    // Dialogue TTS
    if (cut.action && cut.action.includes("\"")) {
      try {
        const dialogueBuffer = await gw.tts(cut.action, {
          provider: "gemini",
          voice: "Kore",
          language: "ko",
        })

        const fileName = `scene_${sceneNumber}_cut_${cut.cut_number}_dialogue.wav`
        const filePath = join(outputDir, fileName)
        await writeFile(filePath, dialogueBuffer)

        const asset = await prisma.asset.create({
          data: {
            projectId,
            type: "AUDIO",
            phase: "POST",
            agentName: "SoundDesigner",
            sceneNumber,
            filePath,
            fileName,
            mimeType: "audio/wav",
            fileSize: dialogueBuffer.length,
            metadata: {
              cutNumber: cut.cut_number,
              audioType: "dialogue",
            },
          },
        })

        assets.push({
          id: asset.id,
          fileName: asset.fileName,
          filePath: asset.filePath,
          sceneNumber,
          cutNumber: cut.cut_number,
          type: "AUDIO",
        })
      } catch (err) {
        console.error(`[generate-audio] Scene ${sceneNumber} Cut ${cut.cut_number} dialogue failed:`, err)
      }
    }
  }

  return c.json({ assets, sceneNumber })
})
```

- [ ] **Step 2: 타입체크**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/routes/screenplay.ts
git commit -m "feat: 씬 단위 오디오 생성 API 추가"
```

---

### Task 4: 프론트엔드 — 에셋 생성 서브탭 추가

**Files:**
- Modify: `apps/web/app/(dashboard)/projects/[id]/screenplay/page.tsx`

이 태스크는 screenplay 페이지의 Step 6 서브탭에 "에셋 생성" 탭을 추가합니다. 파일이 크므로 (700+ lines) 핵심 변경 부분만 기술합니다.

- [ ] **Step 1: 에셋 상태 타입 및 상태 관리 추가**

파일 상단 타입 정의 영역에 추가:

```typescript
interface SceneAssetStatus {
  sceneNumber: number
  sequenceNumber: number
  cutCount: number
  hasImagePrompt: boolean
  hasVideoPrompt: boolean
  imageAssets: Array<{ id: string; fileName: string }>
  videoAssets: Array<{ id: string; fileName: string }>
  audioAssets: Array<{ id: string; fileName: string }>
  generating: "idle" | "image" | "video" | "audio"
}
```

컴포넌트 내부 상태 추가:

```typescript
const [directionSubTab, setDirectionSubTab] = useState<"analysis" | "cuts" | "prompts" | "assets">("analysis")
const [sceneAssetStatuses, setSceneAssetStatuses] = useState<SceneAssetStatus[]>([])
```

- [ ] **Step 2: 에셋 상태 로드 함수 추가**

```typescript
const loadAssetStatuses = useCallback(async () => {
  if (!screenplay?.id || !directionPlan?.scenes) return

  const statuses: SceneAssetStatus[] = []

  for (const scene of directionPlan.scenes) {
    const [imageRes, videoRes, audioRes] = await Promise.all([
      fetchAPI<{ assets: Array<{ id: string; file_name: string }> }>(
        `/api/assets/${projectId}?sceneNumber=${scene.scene_number}&type=IMAGE`
      ).catch(() => ({ assets: [] })),
      fetchAPI<{ assets: Array<{ id: string; file_name: string }> }>(
        `/api/assets/${projectId}?sceneNumber=${scene.scene_number}&type=VIDEO`
      ).catch(() => ({ assets: [] })),
      fetchAPI<{ assets: Array<{ id: string; file_name: string }> }>(
        `/api/assets/${projectId}?sceneNumber=${scene.scene_number}&type=AUDIO`
      ).catch(() => ({ assets: [] })),
    ])

    const cuts = scene.cuts ?? []
    statuses.push({
      sceneNumber: scene.scene_number,
      sequenceNumber: scene.sequence ?? 0,
      cutCount: cuts.length,
      hasImagePrompt: cuts.every((c: Cut) => !!c.image_prompt),
      hasVideoPrompt: cuts.every((c: Cut) => !!c.video_prompt),
      imageAssets: (imageRes.assets ?? []).map(a => ({ id: a.id, fileName: a.file_name })),
      videoAssets: (videoRes.assets ?? []).map(a => ({ id: a.id, fileName: a.file_name })),
      audioAssets: (audioRes.assets ?? []).map(a => ({ id: a.id, fileName: a.file_name })),
      generating: "idle",
    })
  }

  setSceneAssetStatuses(statuses)
}, [projectId, screenplay, directionPlan])
```

- [ ] **Step 3: 생성 핸들러 추가**

```typescript
const handleGenerateAsset = useCallback(async (sceneNumber: number, type: "image" | "video" | "audio") => {
  setSceneAssetStatuses(prev => prev.map(s =>
    s.sceneNumber === sceneNumber ? { ...s, generating: type } : s
  ))

  try {
    if (type === "image") {
      await fetchAPI(`/api/screenplay/${projectId}/direction-plan/storyboard/generate`, {
        method: "POST",
        body: JSON.stringify({ scope: "scene", sceneNumber, style: "webtoon" }),
      })
    } else if (type === "video") {
      await fetchAPI(`/api/screenplay/${projectId}/scene/${sceneNumber}/generate-video`, {
        method: "POST",
      })
    } else {
      await fetchAPI(`/api/screenplay/${projectId}/scene/${sceneNumber}/generate-audio`, {
        method: "POST",
      })
    }

    await loadAssetStatuses()
  } catch (err) {
    setError(err instanceof Error ? err.message : `${type} generation failed`)
  } finally {
    setSceneAssetStatuses(prev => prev.map(s =>
      s.sceneNumber === sceneNumber ? { ...s, generating: "idle" } : s
    ))
  }
}, [projectId, loadAssetStatuses])
```

- [ ] **Step 4: 서브탭 UI 렌더링 추가**

기존 Step 6 서브탭 버튼 영역에 "에셋 생성" 버튼 추가. 기존 3개 버튼 (`시퀀스 분석`, `컷 설계`, `프롬프트`) 뒤에:

```tsx
<button
  onClick={() => { setDirectionSubTab("assets"); loadAssetStatuses() }}
  style={{
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: directionSubTab === "assets" ? "#3b82f6" : "#1e293b",
    color: directionSubTab === "assets" ? "#fff" : "#94a3b8",
  }}
>
  4 에셋 생성
</button>
```

- [ ] **Step 5: 에셋 생성 탭 콘텐츠 렌더링**

서브탭 콘텐츠 영역에 `directionSubTab === "assets"` 조건부 블록 추가:

```tsx
{directionSubTab === "assets" && (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ margin: 0, color: "#e2e8f0" }}>씬별 에셋 생성</h3>
      <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
        프롬프트 완성 씬부터 이미지→비디오→오디오 순서로 생성
      </p>
    </div>

    {sceneAssetStatuses.map((scene) => (
      <div key={scene.sceneNumber} style={{
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <span style={{ color: "#3b82f6", fontWeight: 700, marginRight: "8px" }}>
              S#{scene.sceneNumber}
            </span>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              시퀀스 {scene.sequenceNumber} · {scene.cutCount}컷
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* 이미지 */}
            <button
              disabled={!scene.hasImagePrompt || scene.generating !== "idle"}
              onClick={() => handleGenerateAsset(scene.sceneNumber, "image")}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
                background: scene.imageAssets.length > 0 ? "#065f46" : scene.hasImagePrompt ? "#1e40af" : "#1e293b",
                color: scene.hasImagePrompt ? "#fff" : "#475569",
                opacity: scene.generating === "image" ? 0.6 : 1,
              }}
            >
              {scene.generating === "image" ? "⏳ 생성 중..." :
               scene.imageAssets.length > 0 ? `🖼 재생성 (${scene.imageAssets.length})` : "🖼 이미지 생성"}
            </button>

            {/* 비디오 */}
            <button
              disabled={scene.imageAssets.length === 0 || !scene.hasVideoPrompt || scene.generating !== "idle"}
              onClick={() => handleGenerateAsset(scene.sceneNumber, "video")}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
                background: scene.videoAssets.length > 0 ? "#065f46" : (scene.imageAssets.length > 0 && scene.hasVideoPrompt) ? "#1e40af" : "#1e293b",
                color: (scene.imageAssets.length > 0 && scene.hasVideoPrompt) ? "#fff" : "#475569",
                opacity: scene.generating === "video" ? 0.6 : 1,
              }}
            >
              {scene.generating === "video" ? "⏳ 생성 중..." :
               scene.videoAssets.length > 0 ? `🎬 재생성 (${scene.videoAssets.length})` : "🎬 비디오 생성"}
            </button>

            {/* 오디오 */}
            <button
              disabled={scene.videoAssets.length === 0 || scene.generating !== "idle"}
              onClick={() => handleGenerateAsset(scene.sceneNumber, "audio")}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
                background: scene.audioAssets.length > 0 ? "#065f46" : scene.videoAssets.length > 0 ? "#1e40af" : "#1e293b",
                color: scene.videoAssets.length > 0 ? "#fff" : "#475569",
                opacity: scene.generating === "audio" ? 0.6 : 1,
              }}
            >
              {scene.generating === "audio" ? "⏳ 생성 중..." :
               scene.audioAssets.length > 0 ? `🔊 재생성 (${scene.audioAssets.length})` : "🔊 오디오 생성"}
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        <div style={{ display: "flex", gap: "4px", height: "4px" }}>
          <div style={{ flex: 1, borderRadius: "2px", background: scene.imageAssets.length > 0 ? "#22c55e" : scene.hasImagePrompt ? "#1e40af" : "#1e293b" }} />
          <div style={{ flex: 1, borderRadius: "2px", background: scene.videoAssets.length > 0 ? "#22c55e" : scene.imageAssets.length > 0 ? "#1e40af" : "#1e293b" }} />
          <div style={{ flex: 1, borderRadius: "2px", background: scene.audioAssets.length > 0 ? "#22c55e" : scene.videoAssets.length > 0 ? "#1e40af" : "#1e293b" }} />
        </div>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 6: 타입체크 및 린트**

Run: `bun run typecheck && bun run lint:file -- "apps/web/app/(dashboard)/projects/[id]/screenplay/page.tsx"`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/(dashboard)/projects/[id]/screenplay/page.tsx
git commit -m "feat: Step 6에 씬별 에셋 생성 서브탭 추가"
```

---

### Task 5: 통합 검증

- [ ] **Step 1: 타입체크 + 린트 전체**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 2: 브라우저에서 확인**

1. `http://localhost:3000` 로그인 (daniel@marionette.studio / password123)
2. Somnia Hacker 프로젝트 → Screenplay → Step 6 연출기획
3. 서브탭 "에셋 생성" 클릭
4. 씬별 카드에 이미지/비디오/오디오 버튼 표시 확인
5. 프롬프트 완성된 씬의 이미지 생성 버튼 활성화 확인

- [ ] **Step 3: API 직접 테스트**

```bash
# 에셋 필터링
curl -b "token=$TOKEN" "http://localhost:3001/api/assets/cmmxvposn0000aztqym4gy8so?sceneNumber=1&type=IMAGE"

# 비디오 생성 (실제 Veo 3.0 호출 — API 키 필요)
curl -X POST -b "token=$TOKEN" http://localhost:3001/api/screenplay/cmmxvposn0000aztqym4gy8so/scene/1/generate-video
```

- [ ] **Step 4: 최종 Commit**

```bash
git add -A
git commit -m "feat: 씬별 교차 에셋 생성 — 통합 검증 완료"
```
