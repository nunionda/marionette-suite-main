"use client"

import { useState } from "react"
import { fetchAPI } from "../../../lib/api"

// ─── Types ───

interface GenerateResult {
  coldCatch: string
  extendedPitch: string
  irony: string
  stakes: string
  visual: string
}

interface AnalyzeResult {
  scores: { irony: number; stakes: number; visual: number; pacing: number }
  feedback: string
  improved: string
}

interface VariationsResult {
  variations: string[]
}

// ─── Constants ───

const FORMATS = ["영화", "드라마", "애니메이션", "광고", "단편영화"]
const GENRES = ["SF", "스릴러", "로맨스", "호러", "코미디", "액션", "판타지", "다큐", "미스터리", "사극"]
const VARIATION_STYLES = [
  { value: "darker", label: "더 어둡게 (Darker)" },
  { value: "lighter", label: "더 밝게 (Lighter)" },
  { value: "more_ironic", label: "더 아이러닉하게 (More Ironic)" },
  { value: "more_emotional", label: "더 감성적으로 (More Emotional)" },
] as const

const EXAMPLES = [
  {
    title: "식스센스 (The Sixth Sense)",
    logline: "죽은 사람을 볼 수 있는 소년이, 자신의 비밀을 이해해줄 유일한 어른을 만나지만, 그 어른 역시 자신만의 진실을 마주해야 한다.",
    analysis: "아이러니: 도와주러 온 사람이 사실 도움이 필요한 사람 / 스테이크: 삶과 죽음의 경계 / 비주얼: 겁에 질린 소년의 속삭임",
  },
  {
    title: "이터널 선샤인 (Eternal Sunshine)",
    logline: "기억을 지울 수 있는 세상에서, 한 남자가 이별의 고통을 잊으려 시술을 받지만, 사라져가는 기억 속에서 사랑의 가치를 깨닫는다.",
    analysis: "아이러니: 잊으려 할수록 기억하게 되는 사랑 / 스테이크: 정체성의 상실 / 비주얼: 무너져내리는 기억의 풍경",
  },
  {
    title: "인셉션 (Inception)",
    logline: "꿈 속의 꿈을 설계하는 도둑이, 불가능한 임무를 수행해야만 집에 돌아갈 수 있지만, 현실과 꿈의 경계가 무너지기 시작한다.",
    analysis: "아이러니: 꿈을 조종하는 자가 자신의 꿈에 갇힘 / 스테이크: 가족과의 재회 / 비주얼: 접히는 도시, 무중력 복도",
  },
]

const NAV_SECTIONS = [
  { id: "formula", label: "공식" },
  { id: "template", label: "템플릿" },
  { id: "generator", label: "AI 생성" },
  { id: "analyzer", label: "품질 분석" },
  { id: "examples", label: "예시" },
  { id: "variations", label: "변형" },
]

// ─── Component ───

export default function LoglineGuidePage() {
  // Template state
  const [ironicSetup, setIronicSetup] = useState("")
  const [tacticalDetail, setTacticalDetail] = useState("")
  const [universalEmotion, setUniversalEmotion] = useState("")
  const [combinedLogline, setCombinedLogline] = useState("")

  // Generator state
  const [genIdea, setGenIdea] = useState("")
  const [genFormat, setGenFormat] = useState("")
  const [genGenre, setGenGenre] = useState("")
  const [genLoading, setGenLoading] = useState(false)
  const [genResult, setGenResult] = useState<GenerateResult | null>(null)
  const [genError, setGenError] = useState<string | null>(null)

  // Analyzer state
  const [analyzeInput, setAnalyzeInput] = useState("")
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Variations state
  const [varInput, setVarInput] = useState("")
  const [varStyle, setVarStyle] = useState<"darker" | "lighter" | "more_ironic" | "more_emotional">("darker")
  const [varLoading, setVarLoading] = useState(false)
  const [varResult, setVarResult] = useState<VariationsResult | null>(null)
  const [varError, setVarError] = useState<string | null>(null)

  // ─── Handlers ───

  const handleCombine = () => {
    const parts = [ironicSetup, tacticalDetail, universalEmotion].filter(Boolean)
    setCombinedLogline(parts.join(", "))
  }

  const handleGenerate = async () => {
    if (!genIdea.trim()) return
    setGenLoading(true)
    setGenError(null)
    setGenResult(null)
    try {
      const result = await fetchAPI<GenerateResult>("/api/logline/generate", {
        method: "POST",
        body: JSON.stringify({ idea: genIdea, format: genFormat, genre: genGenre }),
      })
      setGenResult(result)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!analyzeInput.trim()) return
    setAnalyzeLoading(true)
    setAnalyzeError(null)
    setAnalyzeResult(null)
    try {
      const result = await fetchAPI<AnalyzeResult>("/api/logline/analyze", {
        method: "POST",
        body: JSON.stringify({ logline: analyzeInput }),
      })
      setAnalyzeResult(result)
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : String(err))
    } finally {
      setAnalyzeLoading(false)
    }
  }

  const handleVariations = async () => {
    if (!varInput.trim()) return
    setVarLoading(true)
    setVarError(null)
    setVarResult(null)
    try {
      const result = await fetchAPI<VariationsResult>("/api/logline/variations", {
        method: "POST",
        body: JSON.stringify({ logline: varInput, style: varStyle }),
      })
      setVarResult(result)
    } catch (err) {
      setVarError(err instanceof Error ? err.message : String(err))
    } finally {
      setVarLoading(false)
    }
  }

  // ─── Score bar helper ───

  const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-gray-400">{label}</span>
      <div className="h-2.5 flex-1 rounded-full bg-gray-800">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm font-medium text-gray-300">{score}</span>
    </div>
  )

  return (
    <div className="mx-auto flex max-w-[1600px] gap-8">
      {/* Sidebar Navigation */}
      <aside className="sticky top-8 hidden h-fit w-48 flex-shrink-0 lg:block">
        <nav className="space-y-1">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-900 hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">로그라인 작성 가이드</h1>
          <p className="mt-2 text-gray-400">
            하이 컨셉(High-Concept) 로그라인 작성 공식과 AI 도구
          </p>
        </div>

        {/* Section 1: Formula */}
        <section id="formula" className="scroll-mt-8">
          <h2 className="mb-4 text-xl font-semibold">하이 컨셉 로그라인 공식</h2>
          <p className="mb-6 text-sm text-gray-400">
            세 가지 핵심 요소를 조합하여 투자자를 5초 안에 사로잡는 로그라인을 만드세요.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Blue card */}
            <div className="rounded-xl border border-blue-500/30 bg-gray-900/50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                Part 1
              </div>
              <h3 className="mb-1 text-lg font-bold text-blue-300">아이러니 / 훅</h3>
              <p className="text-xs text-blue-200/60">Irony / Hook</p>
              <p className="mt-3 text-sm text-gray-400">
                관객의 기대를 뒤집는 모순적 상황이나 의외의 설정
              </p>
            </div>
            {/* Purple card */}
            <div className="rounded-xl border border-purple-500/30 bg-gray-900/50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                Part 2
              </div>
              <h3 className="mb-1 text-lg font-bold text-purple-300">스테이크 / 갈등</h3>
              <p className="text-xs text-purple-200/60">Stakes / Conflict</p>
              <p className="mt-3 text-sm text-gray-400">
                주인공이 잃을 수 있는 것과 극복해야 할 장애물
              </p>
            </div>
            {/* Amber card */}
            <div className="rounded-xl border border-amber-500/30 bg-gray-900/50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                Part 3
              </div>
              <h3 className="mb-1 text-lg font-bold text-amber-300">감정적 핵심</h3>
              <p className="text-xs text-amber-200/60">Emotional Core</p>
              <p className="mt-3 text-sm text-gray-400">
                관객이 공감하고 감정 이입할 수 있는 보편적 동기
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Template */}
        <section id="template" className="scroll-mt-8">
          <h2 className="mb-4 text-xl font-semibold">템플릿</h2>
          <p className="mb-6 text-sm text-gray-400">
            각 요소를 채워 넣고 합쳐서 로그라인을 완성하세요.
          </p>
          <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-blue-400">
                아이러니한 설정
              </label>
              <textarea
                value={ironicSetup}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIronicSetup(e.target.value)}
                placeholder="예: 죽은 사람을 볼 수 있는 소년이..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-purple-400">
                전술적 디테일
              </label>
              <textarea
                value={tacticalDetail}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTacticalDetail(e.target.value)}
                placeholder="예: 자신의 비밀을 이해해줄 유일한 어른을 만나지만..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-amber-400">
                보편적 감정
              </label>
              <textarea
                value={universalEmotion}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUniversalEmotion(e.target.value)}
                placeholder="예: 그 어른 역시 자신만의 진실을 마주해야 한다."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleCombine}
              disabled={!ironicSetup && !tacticalDetail && !universalEmotion}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              합치기
            </button>
            {combinedLogline && (
              <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="mb-1 text-xs font-medium text-gray-500">완성된 로그라인</div>
                <p className="text-sm leading-relaxed text-gray-200">{combinedLogline}</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: AI Generator */}
        <section id="generator" className="scroll-mt-8">
          <h2 className="mb-4 text-xl font-semibold">AI 로그라인 생성</h2>
          <p className="mb-6 text-sm text-gray-400">
            아이디어를 입력하면 AI가 Cold Catch와 Extended Pitch를 생성합니다.
          </p>
          <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">아이디어</label>
              <textarea
                value={genIdea}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGenIdea(e.target.value)}
                placeholder="영화/드라마의 핵심 아이디어를 입력하세요..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">포맷</label>
                <select
                  value={genFormat}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGenFormat(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">장르</label>
                <select
                  value={genGenre}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGenGenre(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={genLoading || !genIdea.trim()}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {genLoading ? "생성 중..." : "로그라인 생성"}
            </button>
            {genError && (
              <p className="text-sm text-red-400">{genError}</p>
            )}
            {genResult && (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Category A — Cold Catch
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">{genResult.coldCatch}</p>
                </div>
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    Category B — Extended Pitch
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">{genResult.extendedPitch}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                    <div className="mb-1 text-xs font-medium text-gray-500">아이러니</div>
                    <p className="text-xs text-gray-300">{genResult.irony}</p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                    <div className="mb-1 text-xs font-medium text-gray-500">스테이크</div>
                    <p className="text-xs text-gray-300">{genResult.stakes}</p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                    <div className="mb-1 text-xs font-medium text-gray-500">비주얼</div>
                    <p className="text-xs text-gray-300">{genResult.visual}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Quality Analyzer */}
        <section id="analyzer" className="scroll-mt-8">
          <h2 className="mb-4 text-xl font-semibold">품질 분석</h2>
          <p className="mb-6 text-sm text-gray-400">
            로그라인을 붙여넣으면 4가지 기준으로 점수를 매기고 개선안을 제시합니다.
          </p>
          <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">로그라인</label>
              <textarea
                value={analyzeInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnalyzeInput(e.target.value)}
                placeholder="분석할 로그라인을 입력하세요..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzeLoading || !analyzeInput.trim()}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analyzeLoading ? "분석 중..." : "분석하기"}
            </button>
            {analyzeError && (
              <p className="text-sm text-red-400">{analyzeError}</p>
            )}
            {analyzeResult && (
              <div className="mt-4 space-y-5">
                <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    품질 점수
                  </div>
                  <ScoreBar label="아이러니" score={analyzeResult.scores.irony} color="bg-blue-500" />
                  <ScoreBar label="스테이크" score={analyzeResult.scores.stakes} color="bg-red-500" />
                  <ScoreBar label="비주얼" score={analyzeResult.scores.visual} color="bg-purple-500" />
                  <ScoreBar label="페이싱" score={analyzeResult.scores.pacing} color="bg-amber-500" />
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    피드백
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300">{analyzeResult.feedback}</p>
                </div>
                <div className="rounded-lg border border-green-500/30 bg-green-950/20 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400">
                    개선된 버전
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">{analyzeResult.improved}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Examples */}
        <section id="examples" className="scroll-mt-8">
          <h2 className="mb-4 text-xl font-semibold">프로 로그라인 예시</h2>
          <p className="mb-6 text-sm text-gray-400">
            유명 영화들의 로그라인과 하이 컨셉 공식 분석을 참고하세요.
          </p>
          <div className="space-y-4">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.title}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
              >
                <h3 className="mb-2 text-base font-semibold text-gray-200">{ex.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-300">{ex.logline}</p>
                <div className="rounded-lg bg-gray-800/50 px-4 py-2.5 text-xs text-gray-400">
                  {ex.analysis}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Variations */}
        <section id="variations" className="scroll-mt-8">
          <h2 className="mb-4 text-xl font-semibold">로그라인 변형</h2>
          <p className="mb-6 text-sm text-gray-400">
            기존 로그라인을 다양한 스타일로 변형하여 최적의 버전을 찾으세요.
          </p>
          <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">로그라인</label>
              <textarea
                value={varInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVarInput(e.target.value)}
                placeholder="변형할 로그라인을 입력하세요..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">스타일</label>
              <select
                value={varStyle}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setVarStyle(e.target.value as "darker" | "lighter" | "more_ironic" | "more_emotional")
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              >
                {VARIATION_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleVariations}
              disabled={varLoading || !varInput.trim()}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {varLoading ? "생성 중..." : "변형 생성"}
            </button>
            {varError && (
              <p className="text-sm text-red-400">{varError}</p>
            )}
            {varResult && (
              <div className="mt-4 space-y-3">
                {varResult.variations.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-purple-500/20 bg-purple-950/10 p-4"
                  >
                    <div className="mb-1 text-xs font-medium text-purple-400">
                      변형 {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-200">{v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
