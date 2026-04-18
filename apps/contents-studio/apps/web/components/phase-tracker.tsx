"use client"

const PHASES = [
  { key: "DRAFT", label: "Development", icon: "📝" },
  { key: "PRE_PRODUCTION", label: "Pre-Production", icon: "🎨" },
  { key: "MAIN_PRODUCTION", label: "Production", icon: "🎬" },
  { key: "POST_PRODUCTION", label: "Post-Production", icon: "✂️" },
  { key: "COMPLETED", label: "Complete", icon: "✅" },
] as const

type PhaseKey = (typeof PHASES)[number]["key"]

interface PhaseTrackerProps {
  currentPhase: string
  onPhaseClick?: (phase: string) => void
}

function getPhaseStatus(
  phaseKey: PhaseKey,
  currentPhase: string,
): "completed" | "active" | "locked" {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase)
  const phaseIndex = PHASES.findIndex((p) => p.key === phaseKey)

  if (currentIndex < 0) return "locked"
  if (phaseIndex < currentIndex) return "completed"
  if (phaseIndex === currentIndex) return "active"
  return "locked"
}

export function PhaseTracker({ currentPhase, onPhaseClick }: PhaseTrackerProps) {
  return (
    <div className="w-full rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center justify-between">
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.key, currentPhase)
          const isClickable = status === "completed" || status === "active"

          return (
            <div key={phase.key} className="flex flex-1 items-center">
              {/* Step */}
              <button
                type="button"
                onClick={() => {
                  if (isClickable && onPhaseClick) {
                    onPhaseClick(phase.key)
                  }
                }}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Status indicator */}
                <div className="relative flex items-center justify-center">
                  {status === "completed" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  {status === "active" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 animate-pulse">
                      <div className="h-3 w-3 rounded-full bg-white" />
                    </div>
                  )}
                  {status === "locked" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                      <div className="h-3 w-3 rounded-full bg-gray-500" />
                    </div>
                  )}
                </div>

                {/* Icon */}
                <span className="text-lg">{phase.icon}</span>

                {/* Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    status === "completed"
                      ? "text-green-400"
                      : status === "active"
                        ? "text-white"
                        : "text-gray-600"
                  }`}
                >
                  {phase.label}
                </span>
              </button>

              {/* Connector line */}
              {index < PHASES.length - 1 && (() => {
                const nextPhase = PHASES[index + 1]
                if (!nextPhase) return null
                const nextStatus = getPhaseStatus(nextPhase.key, currentPhase)
                return (
                  <div className="mx-2 h-0.5 flex-1">
                    <div
                      className={`h-full rounded-full ${
                        nextStatus === "completed" || nextStatus === "active"
                          ? "bg-green-500"
                          : "bg-gray-700"
                      }`}
                    />
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
