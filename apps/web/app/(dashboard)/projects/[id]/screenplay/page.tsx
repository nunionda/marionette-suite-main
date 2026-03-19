"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../../../../../lib/api"

// ─── Types ───

interface CharacterCasting {
  actor: string
  reason: string
}

interface Character {
  name: string
  age: number
  role: string
  persona: string
  motivation: string
  tone: string
  casting: CharacterCasting
}

interface SceneBreakdownElement {
  cast: string[]
  props: string[]
  location: string[]
}

interface SceneLog {
  scene_number: number
  sequence: number
  sequence_title: string
  location: string
  time_of_day: string
  summary: string
  breakdown: SceneBreakdownElement
}

interface ReviewChecklist {
  character_consistency: boolean
  master_scene_format: boolean
  scene_count: number
  target_scenes: number
  pacing_check: boolean
}

interface ScreenplayData {
  id: string
  projectId: string
  currentStep: number
  idea: string
  outline: string | null
  characters: Character[]
  sceneLogs: string | null
  draft: string | null
  draftVersion: number
  review: ReviewChecklist | null
  feedback: string | null
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  title: string
  idea: string
}

interface SequenceCard {
  index: number
  title: string
  content: string
}

interface Cut {
  cut_number: number
  shot_type: string
  camera_angle: string
  camera_movement: string
  duration: number
  subject: string
  action: string
  image_prompt: string
  video_prompt: string
}

interface DPScene {
  scene_number: number
  sequence: number
  setting: string
  time_of_day: string
  camera_angle: string
  action_description: string
  dialogue: string | null
  image_prompt: string
  video_prompt: string
  cuts: Cut[]
}

// ─── Constants ───

const STEPS = [
  { key: 1, label: "기획", labelEn: "Planning" },
  { key: 2, label: "인물설계", labelEn: "Characters" },
  { key: 3, label: "트리트먼트", labelEn: "Treatment" },
  { key: 4, label: "집필", labelEn: "Screenplay" },
  { key: 5, label: "피드백", labelEn: "Review" },
  { key: 6, label: "연출기획", labelEn: "Direction Plan" },
] as const

const SEQUENCE_COLORS = [
  "border-blue-500 bg-blue-500/10",
  "border-cyan-500 bg-cyan-500/10",
  "border-green-500 bg-green-500/10",
  "border-yellow-500 bg-yellow-500/10",
  "border-orange-500 bg-orange-500/10",
  "border-red-500 bg-red-500/10",
  "border-purple-500 bg-purple-500/10",
  "border-pink-500 bg-pink-500/10",
]

const CHARACTER_BORDER_COLORS = [
  "border-l-blue-500",
  "border-l-cyan-500",
  "border-l-green-500",
  "border-l-yellow-500",
  "border-l-orange-500",
  "border-l-red-500",
  "border-l-purple-500",
  "border-l-pink-500",
]

// ─── Helpers ───

function parseSequences(outline: string): SequenceCard[] {
  const sequences: SequenceCard[] = []
  const sections = outline.split(/^#{2,3}\s+/m).filter(Boolean)

  for (let i = 0; i < sections.length && sequences.length < 8; i++) {
    const section = sections[i].trim()
    const lines = section.split("\n")
    const title = lines[0]?.trim() ?? `Sequence ${sequences.length + 1}`
    const content = lines.slice(1).join("\n").trim()
    if (title) {
      sequences.push({ index: sequences.length, title, content })
    }
  }

  // If no sections found, create a single card with the full outline
  if (sequences.length === 0 && outline.trim()) {
    sequences.push({ index: 0, title: "Outline", content: outline.trim() })
  }

  return sequences
}

function parseScreenplayFormatting(text: string): { type: "heading" | "action" | "character" | "dialogue" | "camera" | "text"; content: string }[] {
  const lines = text.split("\n")
  const result: { type: "heading" | "action" | "character" | "dialogue" | "camera" | "text"; content: string }[] = []

  const cameraKeywords = ["WIDE SHOT", "CLOSE UP", "CLOSE-UP", "ECU", "CU", "MS", "LS", "ELS", "DOLLY", "CRANE", "TRACKING", "PAN", "TILT", "ZOOM", "HANDHELD", "STEADICAM", "JIB", "POV", "ONE SHOT", "TWO SHOT", "OVER THE SHOULDER"]

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^S#\d+\./.test(trimmed)) {
      result.push({ type: "heading", content: trimmed })
    } else if (/^\(.*\)$/.test(trimmed)) {
      result.push({ type: "action", content: trimmed })
    } else if (cameraKeywords.some((kw) => trimmed.toUpperCase().startsWith(kw))) {
      result.push({ type: "camera", content: trimmed })
    } else if (/^[A-Z가-힣\s]+:?$/.test(trimmed) && trimmed.length < 30) {
      result.push({ type: "character", content: trimmed })
    } else if (result.length > 0 && result[result.length - 1].type === "character") {
      result.push({ type: "dialogue", content: trimmed })
    } else {
      result.push({ type: "text", content: trimmed })
    }
  }

  return result
}

// ─── Main Component ───

export default function ScreenplayPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [screenplay, setScreenplay] = useState<ScreenplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)

  // Step 1 state
  const [idea, setIdea] = useState("")
  const [editingOutline, setEditingOutline] = useState(false)
  const [outlineEdit, setOutlineEdit] = useState("")

  // Step 2 state
  const [editingCharacterIdx, setEditingCharacterIdx] = useState<number | null>(null)
  const [newCharacterForm, setNewCharacterForm] = useState(false)
  const [newCharacter, setNewCharacter] = useState<Character>({
    name: "", age: 0, role: "", persona: "", motivation: "", tone: "",
    casting: { actor: "", reason: "" },
  })

  // Step 4 state
  const [editingDraft, setEditingDraft] = useState(false)
  const [draftEdit, setDraftEdit] = useState("")

  // Step 5 state
  const [feedbackText, setFeedbackText] = useState("")

  // Step 6 state
  const [dpScenes, setDpScenes] = useState<DPScene[]>([])
  const [generatingStage, setGeneratingStage] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState(1)

  // ─── Data Loading ───

  const loadData = useCallback(async () => {
    try {
      const [proj, sp] = await Promise.all([
        fetchAPI<Project>(`/api/projects/${projectId}`),
        fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}`),
      ])
      setProject(proj)
      setScreenplay(sp)
      setActiveStep(sp.currentStep || 1)
      setIdea(sp.idea || proj.idea || "")
      if (sp.draft) setDraftEdit(sp.draft)
      if (sp.outline) setOutlineEdit(sp.outline)
      // Load direction plan data
      if ((proj as Record<string, unknown>).direction_plan_json) {
        const dpJson = (proj as Record<string, unknown>).direction_plan_json as { scenes?: DPScene[] }
        if (dpJson?.scenes) setDpScenes(dpJson.scenes)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── API Actions ───

  const generateOutline = async () => {
    setGenerating(true)
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/outline`, {
        method: "POST",
        body: JSON.stringify({ idea }),
      })
      setScreenplay(updated)
      if (updated.outline) setOutlineEdit(updated.outline)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Outline generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const saveOutline = async () => {
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/outline`, {
        method: "PUT",
        body: JSON.stringify({ outline: outlineEdit }),
      })
      setScreenplay(updated)
      setEditingOutline(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  const generateCharacters = async () => {
    setGenerating(true)
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/characters`, {
        method: "POST",
      })
      setScreenplay(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Character generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const saveCharacters = async (characters: Character[]) => {
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/characters`, {
        method: "PUT",
        body: JSON.stringify({ characters }),
      })
      setScreenplay(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  const [generatingSeq, setGeneratingSeq] = useState<number | null>(null)

  const generateSequenceTreatment = async (seq: number) => {
    setGeneratingSeq(seq)
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/treatment/${seq}`, {
        method: "POST",
      })
      setScreenplay(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Sequence ${seq} generation failed`)
    } finally {
      setGeneratingSeq(null)
    }
  }

  const writeNextScenes = async () => {
    setGenerating(true)
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/draft`, {
        method: "POST",
      })
      setScreenplay(updated)
      if (updated.draft) setDraftEdit(updated.draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const saveDraft = async () => {
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/draft`, {
        method: "PUT",
        body: JSON.stringify({ draft: draftEdit }),
      })
      setScreenplay(updated)
      setEditingDraft(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  const resetDraft = async () => {
    const confirmed = window.confirm("대본을 초기화하시겠습니까? 현재 작성된 모든 씬이 삭제됩니다.")
    if (!confirmed) return
    setError(null)
    try {
      await fetchAPI(`/api/screenplay/${projectId}/draft`, {
        method: "DELETE",
      })
      setScreenplay((prev) => prev ? { ...prev, draft: null, draftVersion: 1 } : prev)
      setDraftEdit("")
      setEditingDraft(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed")
    }
  }

  const advanceStep = async (nextStep: number) => {
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/step`, {
        method: "PATCH",
        body: JSON.stringify({ step: nextStep }),
      })
      setScreenplay(updated)
      setActiveStep(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Step update failed")
    }
  }

  const applyFeedback = async () => {
    setGenerating(true)
    setError(null)
    try {
      const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/apply-feedback`, {
        method: "POST",
        body: JSON.stringify({ feedback: feedbackText }),
      })
      setScreenplay(updated)
      if (updated.draft) setDraftEdit(updated.draft)
      setFeedbackText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feedback application failed")
    } finally {
      setGenerating(false)
    }
  }

  // ─── Direction Plan API Actions ───

  const generateSequenceDP = async (seq: number) => {
    setGeneratingStage(`seq-${seq}`)
    try {
      const data = await fetchAPI<{ directionPlan: { scenes: DPScene[] } }>(
        `/api/screenplay/${projectId}/direction-plan/sequence/${seq}`,
        { method: "POST" }
      )
      if (data.directionPlan?.scenes) setDpScenes(data.directionPlan.scenes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setGeneratingStage(null)
    }
  }

  const generateSceneCuts = async (sceneNumber: number) => {
    setGeneratingStage(`cuts-${sceneNumber}`)
    try {
      const data = await fetchAPI<{ directionPlan: { scenes: DPScene[] } }>(
        `/api/screenplay/${projectId}/direction-plan/scene/${sceneNumber}/cuts`,
        { method: "POST" }
      )
      if (data.directionPlan?.scenes) setDpScenes(data.directionPlan.scenes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setGeneratingStage(null)
    }
  }

  const generateCutPrompts = async (sceneNumber: number, cutNumber: number) => {
    setGeneratingStage(`prompts-${sceneNumber}-${cutNumber}`)
    try {
      const data = await fetchAPI<{ directionPlan: { scenes: DPScene[] } }>(
        `/api/screenplay/${projectId}/direction-plan/scene/${sceneNumber}/cut/${cutNumber}/prompts`,
        { method: "POST" }
      )
      if (data.directionPlan?.scenes) setDpScenes(data.directionPlan.scenes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setGeneratingStage(null)
    }
  }

  const generateSceneAll = async (sceneNumber: number) => {
    setGeneratingStage(`all-${sceneNumber}`)
    try {
      const data = await fetchAPI<{ directionPlan: { scenes: DPScene[] } }>(
        `/api/screenplay/${projectId}/direction-plan/scene/${sceneNumber}/generate-all`,
        { method: "POST" }
      )
      if (data.directionPlan?.scenes) setDpScenes(data.directionPlan.scenes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setGeneratingStage(null)
    }
  }

  // ─── Render Helpers ───

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          Loading screenplay...
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error ?? "Project not found"}
      </div>
    )
  }

  const completedSteps = screenplay?.currentStep ?? 1

  return (
    <div style={{ maxWidth: "1600px" }}>
      {/* Back button */}
      <button
        onClick={() => router.push(`/projects/${projectId}`)}
        className="mb-4 text-sm text-gray-400 hover:text-white transition"
      >
        &larr; Back to Project
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="mt-1 text-sm text-gray-400">Screenplay Development</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">&times;</button>
        </div>
      )}

      {/* Content Layout: Main + Sidebar */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* 5-Step Progress Tracker */}
          <div className="mb-6 flex items-center gap-0 rounded-xl border border-gray-800 bg-gray-900/50 p-1 overflow-x-auto">
            {STEPS.map((step, i) => {
              const isCompleted = step.key < completedSteps
              const isActive = step.key === activeStep
              const isLocked = step.key > completedSteps + 1

              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <button
                    onClick={() => !isLocked && setActiveStep(step.key)}
                    disabled={isLocked}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600/20 text-blue-400 shadow-lg ring-1 ring-blue-500/30"
                        : isCompleted
                          ? "text-green-400 hover:bg-gray-800/50"
                          : isLocked
                            ? "cursor-not-allowed text-gray-600"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-700 text-gray-400"
                    }`}>
                      {isCompleted ? "\u2713" : step.key}
                    </span>
                    <span className="hidden md:inline whitespace-nowrap text-xs">{step.label}</span>
                    <span className="hidden xl:inline whitespace-nowrap text-xs text-gray-500">({step.labelEn})</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-4 flex-shrink-0 ${isCompleted ? "bg-green-500" : "bg-gray-700"}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Content */}
          {activeStep === 1 && (
            <Step1Planning
              idea={idea}
              onIdeaChange={setIdea}
              outline={screenplay?.outline ?? null}
              editingOutline={editingOutline}
              outlineEdit={outlineEdit}
              onOutlineEditChange={setOutlineEdit}
              onToggleEdit={() => {
                if (editingOutline) {
                  saveOutline()
                } else {
                  setOutlineEdit(screenplay?.outline ?? "")
                  setEditingOutline(true)
                }
              }}
              onCancelEdit={() => setEditingOutline(false)}
              onGenerate={generateOutline}
              onApprove={() => advanceStep(2)}
              generating={generating}
            />
          )}

          {activeStep === 2 && (
            <Step2Characters
              characters={screenplay?.characters ?? []}
              editingIdx={editingCharacterIdx}
              onEditStart={(idx) => setEditingCharacterIdx(idx)}
              onEditEnd={() => setEditingCharacterIdx(null)}
              onSaveCharacter={(idx, char) => {
                const updated = [...(screenplay?.characters ?? [])]
                updated[idx] = char
                saveCharacters(updated)
                setEditingCharacterIdx(null)
              }}
              newCharacterForm={newCharacterForm}
              onToggleNewForm={() => setNewCharacterForm(!newCharacterForm)}
              newCharacter={newCharacter}
              onNewCharacterChange={setNewCharacter}
              onAddCharacter={() => {
                const updated = [...(screenplay?.characters ?? []), newCharacter]
                saveCharacters(updated)
                setNewCharacterForm(false)
                setNewCharacter({
                  name: "", age: 0, role: "", persona: "", motivation: "", tone: "",
                  casting: { actor: "", reason: "" },
                })
              }}
              onGenerate={generateCharacters}
              onApprove={() => advanceStep(3)}
              generating={generating}
            />
          )}

          {activeStep === 3 && (
            <Step3Treatment
              sceneLogs={(() => { try { return screenplay?.sceneLogs ? JSON.parse(screenplay.sceneLogs) as SceneLog[] : [] } catch { return [] } })()}
              outline={screenplay?.outline ?? ""}
              onGenerateSequence={generateSequenceTreatment}
              onSaveSceneLogs={async (text: string) => {
                try {
                  const updated = await fetchAPI<ScreenplayData>(`/api/screenplay/${projectId}/treatment-text`, {
                    method: "PUT",
                    body: JSON.stringify({ sceneLogs: text }),
                  })
                  setScreenplay(updated)
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Save failed")
                }
              }}
              onApprove={() => advanceStep(4)}
              generatingSeq={generatingSeq}
            />
          )}

          {activeStep === 4 && (
            <Step4Screenplay
              draft={screenplay?.draft ?? null}
              draftVersion={screenplay?.draftVersion ?? 1}
              totalTreatmentScenes={(() => { try { return screenplay?.sceneLogs ? (JSON.parse(screenplay.sceneLogs) as SceneLog[]).length : 120 } catch { return 120 } })()}
              editingDraft={editingDraft}
              draftEdit={draftEdit}
              onDraftEditChange={setDraftEdit}
              onToggleEdit={() => {
                if (editingDraft) {
                  saveDraft()
                } else {
                  setDraftEdit(screenplay?.draft ?? "")
                  setEditingDraft(true)
                }
              }}
              onCancelEdit={() => setEditingDraft(false)}
              onWriteNext={writeNextScenes}
              onSaveDraft={saveDraft}
              onResetDraft={resetDraft}
              onApprove={() => advanceStep(5)}
              generating={generating}
            />
          )}

          {activeStep === 5 && (() => {
            // Auto-generate review checklist from draft data
            const draft = screenplay?.draft ?? ""
            const draftScenes = (draft.match(/S#\d+\./g) ?? []).length
            const treatmentScenes = (() => { try { return screenplay?.sceneLogs ? (JSON.parse(screenplay.sceneLogs) as SceneLog[]).length : 0 } catch { return 0 } })()
            const hasCharacters = Array.isArray(screenplay?.characters) && screenplay.characters.length > 0
            const hasMasterFormat = /###\s*S#\d+\./.test(draft)
            const autoReview: ReviewChecklist = {
              character_consistency: hasCharacters,
              master_scene_format: hasMasterFormat,
              scene_count: draftScenes,
              target_scenes: treatmentScenes || 120,
              pacing_check: draftScenes >= (treatmentScenes || 120) * 0.8,
            }
            return (
              <Step5Review
                review={autoReview}
                feedbackText={feedbackText}
                onFeedbackChange={setFeedbackText}
                onApplyFeedback={applyFeedback}
                onFinalize={() => advanceStep(6)}
                generating={generating}
              />
            )
          })()}

          {activeStep === 6 && (
            <Step6DirectionPlan
              dpScenes={dpScenes}
              outline={screenplay?.outline ?? ""}
              activeStage={activeStage}
              setActiveStage={setActiveStage}
              generatingStage={generatingStage}
              onGenerateSequence={generateSequenceDP}
              onGenerateCuts={generateSceneCuts}
              onGeneratePrompts={generateCutPrompts}
              onGenerateAll={generateSceneAll}
              onFinish={() => router.push(`/projects/${projectId}`)}
            />
          )}
        </div>

        {/* Artifacts Sidebar */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Deliverables</h3>
            <div className="space-y-2">
              <ArtifactItem label="Outline" done={!!screenplay?.outline} />
              <ArtifactItem label="Characters" done={(screenplay?.characters?.length ?? 0) > 0} />
              <ArtifactItem label="Scene Logs" done={!!screenplay?.sceneLogs} />
              <ArtifactItem label="Draft" done={!!screenplay?.draft} />
              <ArtifactItem label="Review" done={!!screenplay?.review} />
              <ArtifactItem label="Direction Plan" done={dpScenes.length > 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Artifact Sidebar Item ───

function ArtifactItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
      done ? "bg-green-500/10 text-green-400" : "bg-gray-800/50 text-gray-500"
    }`}>
      <span className="text-xs">{done ? "\u2705" : "\u2B1C"}</span>
      <span>{label}</span>
    </div>
  )
}

// ─── Step 1: Planning ───

function Step1Planning({
  idea, onIdeaChange, outline, editingOutline, outlineEdit, onOutlineEditChange,
  onToggleEdit, onCancelEdit, onGenerate, onApprove, generating,
}: {
  idea: string
  onIdeaChange: (v: string) => void
  outline: string | null
  editingOutline: boolean
  outlineEdit: string
  onOutlineEditChange: (v: string) => void
  onToggleEdit: () => void
  onCancelEdit: () => void
  onGenerate: () => void
  onApprove: () => void
  generating: boolean
}) {
  const sequences = outline ? parseSequences(outline) : []

  return (
    <div className="space-y-6">
      {/* Idea Input */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-2 text-lg font-semibold">Idea</h2>
        <textarea
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          rows={4}
          placeholder="Enter your story idea..."
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={onGenerate}
          disabled={generating || !idea.trim()}
          className="mt-3 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating Outline...
            </span>
          ) : "Generate Outline"}
        </button>
      </div>

      {/* Outline Display */}
      {outline && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Outline</h2>
            <div className="flex gap-2">
              <button
                onClick={onToggleEdit}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
              >
                {editingOutline ? "Save" : "Edit"}
              </button>
              {editingOutline && (
                <button
                  onClick={onCancelEdit}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {editingOutline ? (
            <textarea
              value={outlineEdit}
              onChange={(e) => onOutlineEditChange(e.target.value)}
              rows={20}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          ) : (
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-950 p-4 text-sm text-gray-300 leading-relaxed overflow-y-auto" style={{ maxHeight: "calc(100vh - 400px)" }}>
              {outline}
            </pre>
          )}
        </div>
      )}

      {/* Beat Board */}
      {sequences.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">8-Sequence Beat Board</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sequences.map((seq) => (
              <div
                key={seq.index}
                className={`min-w-[200px] max-w-[240px] flex-shrink-0 rounded-lg border-l-4 bg-gray-950 p-4 ${SEQUENCE_COLORS[seq.index % 8]}`}
              >
                <div className="mb-1 text-xs font-bold text-gray-400">SEQ {seq.index + 1}</div>
                <div className="mb-2 text-sm font-semibold text-gray-200">{seq.title}</div>
                <p className="text-xs text-gray-400 line-clamp-4">{seq.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve */}
      {outline && (
        <button
          onClick={onApprove}
          className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
        >
          Approve &amp; Next Step &rarr;
        </button>
      )}
    </div>
  )
}

// ─── Step 2: Characters ───

function Step2Characters({
  characters, editingIdx, onEditStart, onEditEnd, onSaveCharacter,
  newCharacterForm, onToggleNewForm, newCharacter, onNewCharacterChange, onAddCharacter,
  onGenerate, onApprove, generating,
}: {
  characters: Character[]
  editingIdx: number | null
  onEditStart: (idx: number) => void
  onEditEnd: () => void
  onSaveCharacter: (idx: number, char: Character) => void
  newCharacterForm: boolean
  onToggleNewForm: () => void
  newCharacter: Character
  onNewCharacterChange: (c: Character) => void
  onAddCharacter: () => void
  onGenerate: () => void
  onApprove: () => void
  generating: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Characters</h2>
          <div className="flex gap-2">
            <button
              onClick={onGenerate}
              disabled={generating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </span>
              ) : "Generate Characters"}
            </button>
            <button
              onClick={onToggleNewForm}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              + Add Character
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {characters.map((char, idx) => (
            <CharacterCard
              key={idx}
              character={char}
              colorClass={CHARACTER_BORDER_COLORS[idx % CHARACTER_BORDER_COLORS.length]}
              editing={editingIdx === idx}
              onEdit={() => onEditStart(idx)}
              onCancel={onEditEnd}
              onSave={(updated) => onSaveCharacter(idx, updated)}
            />
          ))}
        </div>

        {/* New Character Form */}
        {newCharacterForm && (
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-950 p-4">
            <h3 className="mb-3 text-sm font-semibold">New Character</h3>
            <CharacterForm
              character={newCharacter}
              onChange={onNewCharacterChange}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={onAddCharacter} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Add
              </button>
              <button onClick={onToggleNewForm} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve */}
      {characters.length > 0 && (
        <button
          onClick={onApprove}
          className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
        >
          Approve &amp; Next Step &rarr;
        </button>
      )}
    </div>
  )
}

function CharacterCard({
  character, colorClass, editing, onEdit, onCancel, onSave,
}: {
  character: Character
  colorClass: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (c: Character) => void
}) {
  const [editChar, setEditChar] = useState<Character>(character)

  useEffect(() => {
    setEditChar(character)
  }, [character])

  if (editing) {
    return (
      <div className={`rounded-lg border-l-4 bg-gray-950 p-4 ${colorClass}`}>
        <CharacterForm character={editChar} onChange={setEditChar} />
        <div className="mt-3 flex gap-2">
          <button onClick={() => onSave(editChar)} className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700">Save</button>
          <button onClick={onCancel} className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`cursor-pointer rounded-lg border-l-4 bg-gray-950 p-4 transition hover:bg-gray-900 ${colorClass}`}
      onClick={onEdit}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-gray-100">{character.name}</span>
          <span className="ml-2 text-sm text-gray-500">{character.age}세</span>
        </div>
        <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{character.role}</span>
      </div>
      <div className="space-y-1.5 text-xs text-gray-400">
        <p><span className="font-medium text-gray-300">Persona:</span> {character.persona}</p>
        <p><span className="font-medium text-gray-300">Motivation:</span> {character.motivation}</p>
        <p><span className="font-medium text-gray-300">Tone:</span> {character.tone}</p>
      </div>
      <div className="mt-3 border-t border-gray-800 pt-2">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-400">Casting:</span> {character.casting.actor}
        </p>
        <p className="text-xs text-gray-600">{character.casting.reason}</p>
      </div>
    </div>
  )
}

function CharacterForm({ character, onChange }: { character: Character; onChange: (c: Character) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-xs text-gray-400">Name</label>
        <input
          value={character.name}
          onChange={(e) => onChange({ ...character, name: e.target.value })}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Age</label>
        <input
          type="number"
          value={character.age}
          onChange={(e) => onChange({ ...character, age: parseInt(e.target.value) || 0 })}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-xs text-gray-400">Role</label>
        <input
          value={character.role}
          onChange={(e) => onChange({ ...character, role: e.target.value })}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-xs text-gray-400">Persona</label>
        <textarea
          value={character.persona}
          onChange={(e) => onChange({ ...character, persona: e.target.value })}
          rows={2}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-xs text-gray-400">Motivation</label>
        <textarea
          value={character.motivation}
          onChange={(e) => onChange({ ...character, motivation: e.target.value })}
          rows={2}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-xs text-gray-400">Tone</label>
        <input
          value={character.tone}
          onChange={(e) => onChange({ ...character, tone: e.target.value })}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Casting (Actor)</label>
        <input
          value={character.casting.actor}
          onChange={(e) => onChange({ ...character, casting: { ...character.casting, actor: e.target.value } })}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Casting (Reason)</label>
        <input
          value={character.casting.reason}
          onChange={(e) => onChange({ ...character, casting: { ...character.casting, reason: e.target.value } })}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  )
}

// ─── Step 3: Treatment (시퀀스별 생성) ───

function sceneLogsToText(logs: SceneLog[]): string {
  const grouped: Record<number, SceneLog[]> = {}
  for (const log of logs) {
    const seq = log.sequence ?? 1
    if (!grouped[seq]) grouped[seq] = []
    grouped[seq].push(log)
  }
  const lines: string[] = []
  for (const seqStr of Object.keys(grouped).sort((a, b) => Number(a) - Number(b))) {
    const seq = Number(seqStr)
    const seqLogs = grouped[seq] ?? []
    const title = seqLogs[0]?.sequence_title ?? `시퀀스 ${seq}`
    lines.push(`### 시퀀스 ${seq}: ${title}`)
    for (const log of seqLogs) {
      lines.push(`S#${log.scene_number}. ${log.location} - ${log.time_of_day}: ${log.summary}`)
    }
    lines.push("")
  }
  return lines.join("\n")
}

function Step3Treatment({
  sceneLogs, outline, onGenerateSequence, onSaveSceneLogs, onApprove, generatingSeq,
}: {
  sceneLogs: SceneLog[]
  outline: string
  onGenerateSequence: (seq: number) => void
  onSaveSceneLogs: (text: string) => void
  onApprove: () => void
  generatingSeq: number | null
}) {
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null)
  const [editingText, setEditingText] = useState(false)
  const [textEdit, setTextEdit] = useState("")

  // Parse sequence titles from outline
  const sequenceTitles: Record<number, string> = {}
  const seqPattern = /###\s*\d+\.\s*시퀀스\s*\d+[:\s]*(.+)/g
  let match: RegExpExecArray | null
  let seqIdx = 1
  while ((match = seqPattern.exec(outline)) !== null) {
    sequenceTitles[seqIdx] = match[1].trim()
    seqIdx++
  }
  // Fallback if no sequences found
  for (let i = 1; i <= 8; i++) {
    if (!sequenceTitles[i]) sequenceTitles[i] = `시퀀스 ${i}`
  }

  // Group scenes by sequence
  const grouped = sceneLogs.reduce<Record<number, SceneLog[]>>((acc, log) => {
    const seq = log.sequence ?? 1
    if (!acc[seq]) acc[seq] = []
    acc[seq].push(log)
    return acc
  }, {})

  const totalScenes = sceneLogs.length
  const completedSequences = Object.keys(grouped).length

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Scene Logs (Treatment)</h2>
            <p className="mt-1 text-sm text-gray-400">
              시퀀스별로 씬 로그를 생성하세요 ({completedSequences}/8 시퀀스 완료, {totalScenes}씬)
            </p>
          </div>
        </div>

        {/* Scene Logs Text View */}
        {sceneLogs.length > 0 && (
          <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">씬 로그 전체 보기</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (editingText) {
                      onSaveSceneLogs(textEdit)
                      setEditingText(false)
                    } else {
                      setTextEdit(sceneLogsToText(sceneLogs))
                      setEditingText(true)
                    }
                  }}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  {editingText ? "Save" : "Edit"}
                </button>
                {editingText && (
                  <button
                    onClick={() => setEditingText(false)}
                    className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            {editingText ? (
              <textarea
                value={textEdit}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextEdit(e.target.value)}
                rows={20}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <pre className="overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-950 p-4 text-sm text-gray-300 leading-relaxed" style={{ maxHeight: "calc(100vh - 400px)" }}>
                {sceneLogsToText(sceneLogs)}
              </pre>
            )}
          </div>
        )}

        {/* Sequence Cards Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => {
            const seq = i + 1
            const seqScenes = grouped[seq] ?? []
            const isDone = seqScenes.length > 0
            const isGenerating = generatingSeq === seq
            const isExpanded = expandedSeq === seq

            return (
              <div key={seq} className={`rounded-lg border ${SEQUENCE_COLORS[(seq - 1) % 8]} transition`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-300">SEQ {seq}</span>
                    <span className="text-sm font-medium text-gray-200">{sequenceTitles[seq]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDone && (
                      <button
                        onClick={() => setExpandedSeq(isExpanded ? null : seq)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        {seqScenes.length}씬 {isExpanded ? "▲" : "▼"}
                      </button>
                    )}
                    {isDone ? (
                      <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">✓ 완료</span>
                    ) : (
                      <button
                        onClick={() => onGenerateSequence(seq)}
                        disabled={generatingSeq !== null}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            생성 중...
                          </span>
                        ) : "생성하기"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Scene List */}
                {isExpanded && seqScenes.length > 0 && (
                  <div className="space-y-2 border-t border-gray-800 px-4 py-3">
                    {seqScenes.map((log) => (
                      <div key={log.scene_number} className="rounded-lg bg-gray-950 p-3">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                            S#{log.scene_number}
                          </span>
                          <span className="text-sm text-gray-300">{log.location}</span>
                          <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
                            {log.time_of_day}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{log.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {log.breakdown?.cast?.map((c) => (
                            <span key={c} className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs text-red-400">{c}</span>
                          ))}
                          {log.breakdown?.props?.map((p) => (
                            <span key={p} className="rounded bg-orange-500/15 px-1.5 py-0.5 text-xs text-orange-400">{p}</span>
                          ))}
                          {log.breakdown?.location?.map((l) => (
                            <span key={l} className="rounded bg-green-500/15 px-1.5 py-0.5 text-xs text-green-400">{l}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Approve */}
      {totalScenes > 0 && (
        <button
          onClick={onApprove}
          className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
        >
          Approve &amp; Next Step &rarr;
        </button>
      )}
    </div>
  )
}

// ─── Step 4: Screenplay ───

function Step4Screenplay({
  draft, draftVersion, totalTreatmentScenes, editingDraft, draftEdit, onDraftEditChange,
  onToggleEdit, onCancelEdit, onWriteNext, onSaveDraft, onResetDraft, onApprove, generating,
}: {
  draft: string | null
  draftVersion: number
  totalTreatmentScenes: number
  editingDraft: boolean
  draftEdit: string
  onDraftEditChange: (v: string) => void
  onToggleEdit: () => void
  onCancelEdit: () => void
  onWriteNext: () => void
  onSaveDraft: () => void
  onResetDraft: () => void
  onApprove: () => void
  generating: boolean
}) {
  const [activeScene, setActiveScene] = useState(1)

  // Extract scene info (number + location preview) from draft text
  const scenes: { num: number; location: string }[] = []
  if (draft) {
    const matches = draft.matchAll(/S#(\d+)\.\s*(.+)/g)
    for (const match of matches) {
      const num = parseInt(match[1])
      if (!scenes.find((s) => s.num === num)) {
        const location = match[2].split("-")[0].trim().slice(0, 12)
        scenes.push({ num, location })
      }
    }
  }

  const sceneCount = scenes.length
  const lastScene = scenes.length > 0 ? scenes[scenes.length - 1].num : 0
  const nextStart = lastScene + 1
  const nextEnd = lastScene + 5
  const isComplete = sceneCount >= totalTreatmentScenes && totalTreatmentScenes > 0

  const formattedLines = draft ? parseScreenplayFormatting(draft) : []

  const scrollToScene = (num: number) => {
    setActiveScene(num)
    const el = document.getElementById(`scene-${num}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-0 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
        {/* Scene Sidebar */}
        <div className="w-48 flex-shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col">
          <div className="p-3 border-b border-gray-800">
            <p className="text-xs text-gray-500 font-medium">씬 목록</p>
            <p className="text-sm font-semibold text-gray-300 mt-1">
              진행: <span className="text-blue-400">{sceneCount}</span>/{totalTreatmentScenes}씬
            </p>
            {sceneCount > 0 && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-800">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((sceneCount / totalTreatmentScenes) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {scenes.map((scene) => (
              <button
                key={scene.num}
                onClick={() => scrollToScene(scene.num)}
                className={`w-full text-left rounded px-2 py-1.5 text-xs transition flex items-center gap-1.5 ${
                  activeScene === scene.num
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <span className="font-mono font-bold shrink-0">S#{scene.num}</span>
                <span className="truncate">{scene.location}</span>
                {activeScene === scene.num && <span className="ml-auto shrink-0">&#9654;</span>}
              </button>
            ))}
            {scenes.length === 0 && !generating && (
              <p className="text-xs text-gray-600 text-center py-4">아직 작성된 씬이 없습니다</p>
            )}
          </div>

          <div className="p-2 border-t border-gray-800 space-y-1.5">
            {isComplete ? (
              <div className="w-full rounded-lg bg-green-600/20 border border-green-500/30 px-2 py-2 text-xs font-medium text-green-400 text-center">
                전체 씬 작성 완료
              </div>
            ) : (
              <button
                onClick={onWriteNext}
                disabled={generating}
                className="w-full rounded-lg bg-blue-600 px-2 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    작성 중...
                  </span>
                ) : (
                  <>다음 5씬 작성<br /><span className="text-blue-200/70">(S#{nextStart}~S#{nextEnd})</span></>
                )}
              </button>
            )}
            {draft && (
              <button
                onClick={onResetDraft}
                className="w-full rounded-lg border border-red-500/30 px-2 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
              >
                처음부터 다시 쓰기
              </button>
            )}
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Screenplay</h2>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                Draft v{draftVersion}
              </span>
            </div>
            <div className="flex gap-2">
              {draft && !editingDraft && (
                <button
                  onClick={onToggleEdit}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  Edit
                </button>
              )}
              {editingDraft && (
                <>
                  <button
                    onClick={onSaveDraft}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {!draft && !generating && (
              <p className="text-sm text-gray-500">
                아직 대본이 없습니다. 왼쪽 사이드바에서 &quot;다음 5씬 작성&quot;을 클릭하여 시작하세요.
              </p>
            )}

            {generating && !draft && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-gray-800 p-4">
                    <div className="mb-2 h-4 w-32 rounded bg-gray-700" />
                    <div className="h-3 w-full rounded bg-gray-700" />
                    <div className="mt-1 h-3 w-5/6 rounded bg-gray-700" />
                    <div className="mt-1 h-3 w-2/3 rounded bg-gray-700" />
                  </div>
                ))}
              </div>
            )}

            {draft && editingDraft ? (
              <textarea
                value={draftEdit}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onDraftEditChange(e.target.value)}
                rows={30}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            ) : draft ? (
              <div className="rounded-lg bg-gray-950 p-6 font-mono text-sm leading-relaxed">
                {formattedLines.map((line, i) => {
                  switch (line.type) {
                    case "heading": {
                      const sceneNumMatch = line.content.match(/^S#(\d+)/)
                      const sceneId = sceneNumMatch ? `scene-${sceneNumMatch[1]}` : undefined
                      return (
                        <div key={i} id={sceneId} className="mb-3 mt-6 first:mt-0 scroll-mt-4">
                          <span className="mr-2 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                            {line.content.split(".")[0]}
                          </span>
                          <span className="font-bold text-gray-200">{line.content.split(".").slice(1).join(".").trim()}</span>
                        </div>
                      )
                    }
                    case "action":
                      return <p key={i} className="my-1 text-gray-500 italic">{line.content}</p>
                    case "character":
                      return <p key={i} className="mb-0.5 mt-3 font-bold text-yellow-400">{line.content}</p>
                    case "dialogue":
                      return <p key={i} className="mb-2 pl-8 text-gray-200">{line.content}</p>
                    case "camera":
                      return (
                        <div key={i} className="my-1">
                          <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-xs text-blue-400">{line.content}</span>
                        </div>
                      )
                    default:
                      return <p key={i} className="my-1 text-gray-300">{line.content}</p>
                  }
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Completion Signal */}
      {isComplete && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-lg">✓</span>
            <div>
              <h3 className="text-lg font-semibold text-green-400">대본 작성 완료</h3>
              <p className="text-sm text-green-300/70">
                트리트먼트 기준 {totalTreatmentScenes}씬 중 {sceneCount}씬이 작성되었습니다.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            대본을 검토한 후 승인 버튼을 눌러 다음 단계(피드백)로 진행하세요.
          </p>
          <button
            onClick={onApprove}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
          >
            대본 승인 &amp; 피드백 단계로 &rarr;
          </button>
        </div>
      )}

      {/* Not yet complete */}
      {draft && !isComplete && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">
            트리트먼트 기준 {totalTreatmentScenes}씬 중 {sceneCount}씬 작성됨 — 나머지 {totalTreatmentScenes - sceneCount}씬을 계속 작성하세요.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Step 5: Review ───

function Step5Review({
  review, feedbackText, onFeedbackChange, onApplyFeedback, onFinalize, generating,
}: {
  review: ReviewChecklist | null
  feedbackText: string
  onFeedbackChange: (v: string) => void
  onApplyFeedback: () => void
  onFinalize: () => void
  generating: boolean
}) {
  const checkIcon = (val: boolean) => val ? "\u2705" : "\u274C"

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Review Checklist</h2>

        {review ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-950 px-4 py-3">
              <span className="text-lg">{checkIcon(review.character_consistency)}</span>
              <span className="text-sm text-gray-300">Character Consistency</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-950 px-4 py-3">
              <span className="text-lg">{checkIcon(review.master_scene_format)}</span>
              <span className="text-sm text-gray-300">Master Scene Format</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-950 px-4 py-3">
              <span className="text-lg">{review.scene_count >= review.target_scenes ? "\u2705" : "\u274C"}</span>
              <span className="text-sm text-gray-300">
                Scene Count: {review.scene_count} / {review.target_scenes}
              </span>
              <div className="ml-auto h-2 w-32 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(100, (review.scene_count / review.target_scenes) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-950 px-4 py-3">
              <span className="text-lg">{checkIcon(review.pacing_check)}</span>
              <span className="text-sm text-gray-300">Pacing Check</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Review data will appear after the draft is analyzed.</p>
        )}
      </div>

      {/* Feedback */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-2 text-lg font-semibold">Feedback</h2>
        <p className="mb-3 text-sm text-gray-400">
          Provide feedback for AI to revise the screenplay.
        </p>
        <textarea
          value={feedbackText}
          onChange={(e) => onFeedbackChange(e.target.value)}
          rows={5}
          placeholder="Enter your feedback for revision..."
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <div className="mt-3 flex gap-3">
          <button
            onClick={onApplyFeedback}
            disabled={generating || !feedbackText.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Applying...
              </span>
            ) : "Apply Feedback"}
          </button>
          <button
            onClick={onFinalize}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Finalize &rarr; Direction Plan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 6: Direction Plan ───

function Step6DirectionPlan({
  dpScenes, outline, activeStage, setActiveStage, generatingStage,
  onGenerateSequence, onGenerateCuts, onGeneratePrompts, onGenerateAll, onFinish,
}: {
  dpScenes: DPScene[]
  outline: string
  activeStage: number
  setActiveStage: (n: number) => void
  generatingStage: string | null
  onGenerateSequence: (seq: number) => void
  onGenerateCuts: (sceneNumber: number) => void
  onGeneratePrompts: (sceneNumber: number, cutNumber: number) => void
  onGenerateAll: (sceneNumber: number) => void
  onFinish: () => void
}) {
  const [expandedScene, setExpandedScene] = useState<number | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null)
  const [promptEdit, setPromptEdit] = useState({ image: "", video: "" })

  // Parse sequence titles from outline
  const sequenceTitles: Record<number, string> = {}
  const seqPattern = /###\s*\d+\.\s*시퀀스\s*\d+[:\s]*(.+)/g
  let match: RegExpExecArray | null
  let seqIdx = 1
  while ((match = seqPattern.exec(outline)) !== null) {
    sequenceTitles[seqIdx] = match[1].trim()
    seqIdx++
  }
  for (let i = 1; i <= 8; i++) {
    if (!sequenceTitles[i]) sequenceTitles[i] = `시퀀스 ${i}`
  }

  // Group scenes by sequence
  const grouped = dpScenes.reduce<Record<number, DPScene[]>>((acc, scene) => {
    const seq = scene.sequence ?? 1
    if (!acc[seq]) acc[seq] = []
    acc[seq].push(scene)
    return acc
  }, {})

  const STAGE_TABS = [
    { key: 1, label: "시퀀스 분석" },
    { key: 2, label: "컷 설계" },
    { key: 3, label: "프롬프트" },
  ]

  return (
    <div className="space-y-6">
      {/* Sub-stage Navigator */}
      <div className="flex gap-2 mb-4">
        {STAGE_TABS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStage(s.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeStage === s.key
                ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span className={`mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
              activeStage === s.key ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
            }`}>
              {s.key}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Stage 1: Sequence Analysis */}
      {activeStage === 1 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">시퀀스별 씬 분석</h2>
            <p className="mt-1 text-sm text-gray-400">
              각 시퀀스를 분석하여 씬별 연출 기획을 생성합니다
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const seq = i + 1
              const seqScenes = grouped[seq] ?? []
              const isDone = seqScenes.length > 0
              const isGenerating = generatingStage === `seq-${seq}`

              return (
                <div key={seq} className={`rounded-lg border ${SEQUENCE_COLORS[(seq - 1) % 8]} transition`}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-300">SEQ {seq}</span>
                      <span className="text-sm font-medium text-gray-200">{sequenceTitles[seq]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                          {seqScenes.length}씬 완료
                        </span>
                      ) : (
                        <button
                          onClick={() => onGenerateSequence(seq)}
                          disabled={generatingStage !== null}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <span className="flex items-center gap-1.5">
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              분석 중...
                            </span>
                          ) : "분석하기"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stage 2: Cut Design */}
      {activeStage === 2 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">씬별 컷 설계</h2>
            <p className="mt-1 text-sm text-gray-400">
              각 씬의 컷을 설계합니다 ({dpScenes.length}씬)
            </p>
          </div>

          {dpScenes.length === 0 ? (
            <p className="text-sm text-gray-500">먼저 시퀀스 분석을 완료하세요.</p>
          ) : (
            <div className="space-y-3">
              {dpScenes.map((scene) => {
                const isExpanded = expandedScene === scene.scene_number
                const hasCuts = scene.cuts && scene.cuts.length > 0
                const isGeneratingCuts = generatingStage === `cuts-${scene.scene_number}`
                const isGeneratingAll = generatingStage === `all-${scene.scene_number}`

                return (
                  <div key={scene.scene_number} className={`rounded-lg border ${SEQUENCE_COLORS[((scene.sequence ?? 1) - 1) % 8]}`}>
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedScene(isExpanded ? null : scene.scene_number)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                          S#{scene.scene_number}
                        </span>
                        <span className="text-sm text-gray-300">{scene.setting}</span>
                        <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
                          {scene.time_of_day}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasCuts && (
                          <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                            {scene.cuts.length} cuts
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 border-t border-gray-800 px-4 py-3">
                        <div className="mb-2 text-xs text-gray-400">
                          <p>{scene.action_description}</p>
                          {scene.dialogue && (
                            <p className="mt-1 italic text-gray-500">{scene.dialogue}</p>
                          )}
                        </div>

                        {hasCuts ? (
                          <div className="space-y-2">
                            {scene.cuts.map((cut) => (
                              <div key={cut.cut_number} className="rounded-lg bg-gray-950 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs font-bold text-purple-400">
                                    CUT {cut.cut_number}
                                  </span>
                                  <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">{cut.shot_type}</span>
                                  <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">{cut.camera_angle}</span>
                                  <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">{cut.camera_movement}</span>
                                  <span className="ml-auto text-xs text-gray-500">{cut.duration}s</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                  <span className="font-medium text-gray-300">Subject:</span> {cut.subject}
                                </p>
                                <p className="text-xs text-gray-400">
                                  <span className="font-medium text-gray-300">Action:</span> {cut.action}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onGenerateCuts(scene.scene_number)}
                              disabled={generatingStage !== null}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                              {isGeneratingCuts ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                  생성 중...
                                </span>
                              ) : "컷 설계하기"}
                            </button>
                            <button
                              onClick={() => onGenerateAll(scene.scene_number)}
                              disabled={generatingStage !== null}
                              className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition disabled:opacity-50"
                            >
                              {isGeneratingAll ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                  전체 생성 중...
                                </span>
                              ) : "전체 생성"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Stage 3: Prompts */}
      {activeStage === 3 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">프롬프트 확인</h2>
            <p className="mt-1 text-sm text-gray-400">
              각 컷의 이미지/비디오 프롬프트를 확인하고 편집합니다
            </p>
          </div>

          {dpScenes.length === 0 ? (
            <p className="text-sm text-gray-500">먼저 시퀀스 분석과 컷 설계를 완료하세요.</p>
          ) : (
            <div className="space-y-4">
              {dpScenes.map((scene) => {
                const hasCuts = scene.cuts && scene.cuts.length > 0

                return (
                  <div key={scene.scene_number} className={`rounded-lg border ${SEQUENCE_COLORS[((scene.sequence ?? 1) - 1) % 8]}`}>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                          S#{scene.scene_number}
                        </span>
                        <span className="text-sm text-gray-300">{scene.setting}</span>
                        <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
                          {scene.time_of_day}
                        </span>
                      </div>

                      {/* Scene-level prompts */}
                      {scene.image_prompt && (
                        <div className="mb-2 rounded bg-gray-950 p-2">
                          <span className="text-xs font-medium text-cyan-400">Scene Image Prompt:</span>
                          <p className="text-xs text-gray-400 mt-0.5">{scene.image_prompt}</p>
                        </div>
                      )}

                      {hasCuts && (
                        <div className="space-y-2 mt-2">
                          {scene.cuts.map((cut) => {
                            const editKey = `${scene.scene_number}-${cut.cut_number}`
                            const isEditing = editingPrompt === editKey
                            const isRegenerating = generatingStage === `prompts-${scene.scene_number}-${cut.cut_number}`

                            return (
                              <div key={cut.cut_number} className="rounded-lg bg-gray-950 p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs font-bold text-purple-400">
                                      CUT {cut.cut_number}
                                    </span>
                                    <span className="text-xs text-gray-500">{cut.shot_type} / {cut.camera_angle}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        if (isEditing) {
                                          setEditingPrompt(null)
                                        } else {
                                          setEditingPrompt(editKey)
                                          setPromptEdit({ image: cut.image_prompt, video: cut.video_prompt })
                                        }
                                      }}
                                      className="rounded border border-gray-700 px-2 py-0.5 text-xs text-gray-400 hover:text-white transition"
                                    >
                                      {isEditing ? "Done" : "Edit"}
                                    </button>
                                    <button
                                      onClick={() => onGeneratePrompts(scene.scene_number, cut.cut_number)}
                                      disabled={generatingStage !== null}
                                      className="rounded border border-gray-700 px-2 py-0.5 text-xs text-gray-400 hover:text-white transition disabled:opacity-50"
                                    >
                                      {isRegenerating ? (
                                        <span className="flex items-center gap-1">
                                          <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white/30 border-t-white" />
                                        </span>
                                      ) : "Regen"}
                                    </button>
                                  </div>
                                </div>

                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div>
                                      <label className="mb-1 block text-xs text-cyan-400">Image Prompt</label>
                                      <textarea
                                        value={promptEdit.image}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptEdit({ ...promptEdit, image: e.target.value })}
                                        rows={3}
                                        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs text-orange-400">Video Prompt</label>
                                      <textarea
                                        value={promptEdit.video}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptEdit({ ...promptEdit, video: e.target.value })}
                                        rows={3}
                                        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    {cut.image_prompt && (
                                      <div>
                                        <span className="text-xs font-medium text-cyan-400">Image:</span>
                                        <p className="text-xs text-gray-400 mt-0.5">{cut.image_prompt}</p>
                                      </div>
                                    )}
                                    {cut.video_prompt && (
                                      <div>
                                        <span className="text-xs font-medium text-orange-400">Video:</span>
                                        <p className="text-xs text-gray-400 mt-0.5">{cut.video_prompt}</p>
                                      </div>
                                    )}
                                    {!cut.image_prompt && !cut.video_prompt && (
                                      <p className="text-xs text-gray-600 italic">No prompts generated yet</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {!hasCuts && (
                        <p className="text-xs text-gray-600 italic">No cuts designed yet. Go to Stage 2 first.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Bottom: Navigate to Pre-Production */}
      <button
        onClick={onFinish}
        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Pre-Production으로 이동 &rarr;
      </button>
    </div>
  )
}
