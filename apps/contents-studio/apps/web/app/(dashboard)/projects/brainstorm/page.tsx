"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { fetchAPI } from "../../../../lib/api"

// ─── Types ───

interface ConceptCard {
  id: string
  title: string
  logline: string
  genres: string[]
  tone: string
  synopsis: string
  moodKeywords: string[]
}

interface ExpandedConcept {
  logline: string
  synopsis: string
  characters: { name: string; role: string; description: string }[]
  themes: string[]
  comparables: string
}

// ─── Constants ───

const STEPS = [
  { key: 1, label: "아이디어 발화", labelEn: "Idea Spark" },
  { key: 2, label: "컨셉 선택", labelEn: "Select" },
  { key: 3, label: "컨셉 개발", labelEn: "Develop" },
  { key: 4, label: "프로젝트 생성", labelEn: "Create" },
] as const

const FORMATS = ["영화", "드라마", "애니메이션", "광고", "단편영화"]
const GENRES = ["SF", "스릴러", "로맨스", "호러", "코미디", "액션", "판타지", "다큐", "미스터리", "사극"]
const AUDIENCES = ["전체관람가", "12세 이상", "15세 이상", "청불", "가족", "어린이"]
const CHAR_COLORS = ["border-l-blue-500", "border-l-green-500", "border-l-amber-500", "border-l-red-500", "border-l-purple-500"]

export default function StandaloneBrainstormPage() {
  const router = useRouter()

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)

  // Step 1
  const [format, setFormat] = useState("")
  const [genres, setGenres] = useState<string[]>([])
  const [seed, setSeed] = useState("")
  const [audience, setAudience] = useState("")

  // Step 2
  const [concepts, setConcepts] = useState<ConceptCard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Step 3
  const [expanded, setExpanded] = useState<ExpandedConcept | null>(null)
  const [editingLogline, setEditingLogline] = useState(false)
  const [editingSynopsis, setEditingSynopsis] = useState(false)
  const [loglineDraft, setLoglineDraft] = useState("")
  const [synopsisDraft, setSynopsisDraft] = useState("")

  // Step 4
  const [finalTitle, setFinalTitle] = useState("")
  const [finalGenre, setFinalGenre] = useState("")
  const [finalLogline, setFinalLogline] = useState("")
  const [finalIdea, setFinalIdea] = useState("")

  const canGo = (step: number) => {
    if (step <= 1) return true
    if (step === 2) return concepts.length > 0
    if (step === 3) return !!selectedId
    if (step === 4) return !!expanded
    return false
  }

  const toggleGenre = (g: string) => setGenres((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g])

  // ─── API ───

  const generateIdeas = async () => {
    setGenerating(true)
    setError(null)
    try {
      const { concepts: c } = await fetchAPI<{ concepts: ConceptCard[] }>("/api/brainstorm/generate-ideas", {
        method: "POST",
        body: JSON.stringify({ format, genres, seed, targetAudience: audience }),
      })
      setConcepts(c)
      setActiveStep(2)
    } catch (e) {
      setError(e instanceof Error ? e.message : "생성 실패")
    } finally {
      setGenerating(false)
    }
  }

  const addMore = async () => {
    setGenerating(true)
    try {
      const { concepts: c } = await fetchAPI<{ concepts: ConceptCard[] }>("/api/brainstorm/generate-ideas", {
        method: "POST",
        body: JSON.stringify({ format, genres, seed, targetAudience: audience }),
      })
      setConcepts((p) => [...p, ...c])
    } catch (e) {
      setError(e instanceof Error ? e.message : "추가 생성 실패")
    } finally {
      setGenerating(false)
    }
  }

  const refine = async (concept: ConceptCard) => {
    setGenerating(true)
    setError(null)
    try {
      const { expanded: ex } = await fetchAPI<{ expanded: ExpandedConcept }>("/api/brainstorm/refine-concept", {
        method: "POST",
        body: JSON.stringify({ title: concept.title, logline: concept.logline, genres: concept.genres, tone: concept.tone, synopsis: concept.synopsis }),
      })
      setExpanded(ex)
      setLoglineDraft(ex.logline)
      setSynopsisDraft(ex.synopsis)
      setFinalTitle(concept.title)
      setFinalGenre(concept.genres.join(", "))
      setFinalLogline(ex.logline)
      setFinalIdea(ex.synopsis)
      setActiveStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : "컨셉 발전 실패")
    } finally {
      setGenerating(false)
    }
  }

  const regenSection = async (section: string) => {
    if (!expanded || !selectedId) return
    const concept = concepts.find((c) => c.id === selectedId)
    if (!concept) return
    setGenerating(true)
    try {
      const ctx = `Title: ${concept.title}\nLogline: ${expanded.logline}\nSynopsis: ${expanded.synopsis}`
      const { result } = await fetchAPI<{ result: unknown }>("/api/brainstorm/generate-logline", {
        method: "POST",
        body: JSON.stringify({ context: ctx, section }),
      })
      setExpanded((p) => {
        if (!p) return p
        const u = { ...p }
        if (section === "logline" && typeof result === "string") { u.logline = result; setLoglineDraft(result); setFinalLogline(result) }
        else if (section === "synopsis" && typeof result === "string") { u.synopsis = result; setSynopsisDraft(result); setFinalIdea(result) }
        else if (section === "characters" && Array.isArray(result)) u.characters = result as ExpandedConcept["characters"]
        else if (section === "themes" && Array.isArray(result)) u.themes = result as string[]
        else if (section === "comparables" && typeof result === "string") u.comparables = result
        return u
      })
    } catch { setError("재생성 실패") }
    finally { setGenerating(false) }
  }

  const goToNewProject = () => {
    const params = new URLSearchParams({
      title: finalTitle,
      genre: finalGenre,
      logline: loglineDraft || finalLogline,
      idea: synopsisDraft || finalIdea,
    })
    router.push(`/projects/new?${params.toString()}`)
  }

  // Auto-refine on step 3
  useEffect(() => {
    if (activeStep === 3 && selectedId && !expanded && !generating) {
      const sel = concepts.find((c) => c.id === selectedId)
      if (sel) refine(sel)
    }
  }, [activeStep, selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render ───

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.push("/projects")} className="mb-4 text-sm text-gray-400 hover:text-white transition">
        &larr; 프로젝트 목록으로
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">💡 브레인스토밍</h1>
        <p className="mt-1 text-sm text-gray-400">AI와 함께 아이디어를 탐색하고 컨셉을 개발하세요</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error} <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">&times;</button>
        </div>
      )}

      {/* Step Nav */}
      <div className="mb-6 flex items-center rounded-xl border border-gray-800 bg-gray-900/50 p-1">
        {STEPS.map((s, i) => {
          const done = canGo(s.key + 1), active = s.key === activeStep, locked = !canGo(s.key)
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <button onClick={() => !locked && setActiveStep(s.key)} disabled={locked}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? "bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/30" : done ? "text-green-400 hover:bg-gray-800/50" : locked ? "cursor-not-allowed text-gray-600" : "text-gray-400 hover:text-white"
                }`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-amber-500 text-white" : done ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"}`}>
                  {done ? "✓" : s.key}
                </span>
                <span className="hidden md:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`h-px w-4 flex-shrink-0 ${done ? "bg-green-500" : "bg-gray-700"}`} />}
            </div>
          )
        })}
      </div>

      {/* ═══ STEP 1 ═══ */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-3 text-sm font-medium text-gray-300">포맷</h3>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${format === f ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30" : "border border-gray-700 text-gray-400 hover:text-white"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-3 text-sm font-medium text-gray-300">장르 (복수 선택)</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button key={g} onClick={() => toggleGenre(g)} className={`rounded-lg px-3 py-1.5 text-sm transition ${genres.includes(g) ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "border border-gray-700 text-gray-500 hover:text-gray-300"}`}>{g}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-3 text-sm font-medium text-gray-300">아이디어</h3>
            <textarea value={seed} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSeed(e.target.value)} rows={4}
              placeholder="어떤 이야기를 만들고 싶으신가요? 자유롭게 적어주세요"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-3 text-sm font-medium text-gray-300">타겟 관객</h3>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button key={a} onClick={() => setAudience(a)} className={`rounded-lg px-3 py-1.5 text-sm transition ${audience === a ? "bg-green-600/20 text-green-400 border border-green-500/30" : "border border-gray-700 text-gray-500 hover:text-gray-300"}`}>{a}</button>
              ))}
            </div>
          </div>
          <button onClick={generateIdeas} disabled={generating || !seed.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg px-6 py-3.5 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
            {generating ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> 생성 중...</> : <>💡 아이디어 생성</>}
          </button>
        </div>
      )}

      {/* ═══ STEP 2 ═══ */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">컨셉 ({concepts.length}개)</h2>
            <button onClick={addMore} disabled={generating} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50">{generating ? "생성 중..." : "더 생성"}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                className={`rounded-xl border p-5 text-left transition relative ${selectedId === c.id ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-gray-800 bg-gray-900 hover:border-gray-600"}`}>
                {selectedId === c.id && <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">✓</span>}
                <h4 className="text-lg font-bold">{c.title}</h4>
                <p className="text-sm text-gray-300 mt-2">{c.logline}</p>
                <div className="flex flex-wrap gap-1 mt-3">{c.genres?.map((g) => <span key={g} className="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-400">{g}</span>)}</div>
                <p className="text-xs italic text-gray-500 mt-2">{c.tone}</p>
                <p className="text-sm text-gray-400 mt-3">{c.synopsis}</p>
                {c.moodKeywords?.length > 0 && <div className="flex flex-wrap gap-1 mt-3">{c.moodKeywords.map((k) => <span key={k} className="bg-gray-800/50 text-xs px-2 py-0.5 rounded text-gray-500">{k}</span>)}</div>}
              </button>
            ))}
          </div>
          <button onClick={() => { const sel = concepts.find((c) => c.id === selectedId); if (sel) refine(sel) }}
            disabled={!selectedId || generating}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50">
            {generating ? "발전 중..." : "선택한 컨셉 발전시키기 →"}
          </button>
        </div>
      )}

      {/* ═══ STEP 3 ═══ */}
      {activeStep === 3 && !expanded && (
        <div className="flex flex-col items-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500 mb-4" />
          <p className="text-gray-400">컨셉 발전 중...</p>
        </div>
      )}
      {activeStep === 3 && expanded && (
        <div className="space-y-4">
          {/* Logline */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">로그라인</h3>
              <div className="flex gap-2">
                <button onClick={() => setEditingLogline(!editingLogline)} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white">{editingLogline ? "완료" : "편집"}</button>
                <button onClick={() => regenSection("logline")} disabled={generating} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50">재생성</button>
              </div>
            </div>
            {editingLogline ? <textarea value={loglineDraft} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLoglineDraft(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" />
              : <p className="text-sm text-gray-300">{expanded.logline}</p>}
          </div>
          {/* Synopsis */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">시놉시스</h3>
              <div className="flex gap-2">
                <button onClick={() => setEditingSynopsis(!editingSynopsis)} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white">{editingSynopsis ? "완료" : "편집"}</button>
                <button onClick={() => regenSection("synopsis")} disabled={generating} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50">재생성</button>
              </div>
            </div>
            {editingSynopsis ? <textarea value={synopsisDraft} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSynopsisDraft(e.target.value)} rows={8} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" />
              : <p className="text-sm text-gray-400 whitespace-pre-line">{expanded.synopsis}</p>}
          </div>
          {/* Characters */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">캐릭터 스케치</h3>
              <button onClick={() => regenSection("characters")} disabled={generating} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50">재생성</button>
            </div>
            <div className="space-y-3">
              {expanded.characters?.map((ch, i) => (
                <div key={i} className={`border-l-4 ${CHAR_COLORS[i % CHAR_COLORS.length]} rounded-lg bg-gray-800/50 p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{ch.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{ch.role}</span>
                  </div>
                  <p className="text-sm text-gray-400">{ch.description}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Themes */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">테마</h3>
              <button onClick={() => regenSection("themes")} disabled={generating} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50">재생성</button>
            </div>
            <div className="flex flex-wrap gap-2">{expanded.themes?.map((t) => <span key={t} className="bg-gray-800 text-sm px-3 py-1 rounded-full text-gray-300">{t}</span>)}</div>
          </div>
          {/* Comparables */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">비교 작품</h3>
              <button onClick={() => regenSection("comparables")} disabled={generating} className="text-xs border border-gray-700 rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50">재생성</button>
            </div>
            <p className="text-sm text-gray-400 italic">{expanded.comparables}</p>
          </div>
          <button onClick={() => setActiveStep(4)} className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition">프로젝트 생성으로 →</button>
        </div>
      )}

      {/* ═══ STEP 4 ═══ */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-semibold mb-4">프로젝트 정보 확인</h3>
            <div className="space-y-4">
              <div><label className="mb-1 block text-xs text-gray-400">제목</label>
                <input value={finalTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinalTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs text-gray-400">장르</label>
                <input value={finalGenre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinalGenre(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs text-gray-400">로그라인</label>
                <textarea value={finalLogline} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFinalLogline(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs text-gray-400">시놉시스</label>
                <textarea value={finalIdea} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFinalIdea(e.target.value)} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            </div>
          </div>
          {expanded && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">컨셉 요약</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">캐릭터:</span> <span className="text-gray-300">{expanded.characters?.map((c) => `${c.name} (${c.role})`).join(", ")}</span></p>
                <p><span className="text-gray-500">테마:</span> <span className="text-gray-300">{expanded.themes?.join(", ")}</span></p>
                <p><span className="text-gray-500">비교 작품:</span> <span className="text-gray-300 italic">{expanded.comparables}</span></p>
              </div>
            </div>
          )}
          <button onClick={goToNewProject} disabled={!finalTitle.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg px-6 py-3.5 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
            프로젝트 생성 페이지로 이동 →
          </button>
        </div>
      )}
    </div>
  )
}
